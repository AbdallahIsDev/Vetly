import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import {
    animate,
    motion,
    useInView,
    useMotionTemplate,
    useMotionValue,
    useScroll,
    useTransform,
} from "framer-motion"

type RevealDirection =
    | "bottom"
    | "top"
    | "left"
    | "right"
    | "bottom-left-to-top-right"
    | "bottom-right-to-top-left"
    | "top-left-to-bottom-right"
    | "top-right-to-bottom-left"

type RevealMode = "inView" | "scroll" | "revealed"
type ResponsiveImageLike = {
    src: string
    srcSet?: string
    alt?: string
}

type Props = {
    image?: ResponsiveImageLike
    revealEnabled: boolean
    scaleFrom: number
    direction: RevealDirection
    initialSize: number
    revealMode: RevealMode
    inViewAmount: number
    scrollStart: number
    scrollEnd: number
    transition: any
    placeholderBackground: string
    once: boolean
    shadowEnabled: boolean
    shadow: string
    radius?: any
    radiusPerCorner?: boolean
    topLeft?: number
    topRight?: number
    bottomRight?: number
    bottomLeft?: number
    border?: any
    style?: React.CSSProperties
    imagePadding: string
    hoverEnabled: boolean
    hoverScale: number
    hoverTransition: any
}

const DIAGONAL_DIRECTIONS: RevealDirection[] = [
    "bottom-left-to-top-right",
    "bottom-right-to-top-left",
    "top-left-to-bottom-right",
    "top-right-to-bottom-left",
]

/**
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 300
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ImageReveal(props: Props) {
    const {
        image = {
            src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
            alt: "Image",
        },
        revealEnabled = true,
        scaleFrom = 1.3,
        direction = "bottom",
        initialSize = 10,
        revealMode = "inView",
        inViewAmount = 0.35,
        scrollStart = 0.2,
        scrollEnd = 0.6,
        transition = {
            type: "tween" as const,
            duration: 1.5,
            ease: [0.77, 0, 0.175, 1] as [number, number, number, number],
        },
        placeholderBackground = "#000000",
        once = true,
        shadowEnabled = false,
        shadow = "0px 10px 30px 0px rgba(0,0,0,0.25)",
        radius = 0,
        border,
        style,
        imagePadding = "0px",
        hoverEnabled = false,
        hoverScale = 1.05,
        hoverTransition = { type: "spring" as const, stiffness: 300, damping: 20 },
    } = props

    const isStatic = useIsStaticRenderer()

    // When the reveal is disabled, behave like a plain static image.
    const noReveal = !revealEnabled

    const isDiagonal = React.useMemo(
        () => DIAGONAL_DIRECTIONS.includes(direction),
        [direction]
    )

    const ref = React.useRef<HTMLDivElement | null>(null)
    const inView = useInView(ref, { amount: inViewAmount, once })

    const shouldAnimateInView = !isStatic && !noReveal && inView

    // ---------------------------------------------------------------
    // SCROLL / IN-VIEW PROGRESS
    // ---------------------------------------------------------------
    const scrollYProgress = useScroll(
        revealMode === "scroll" && !noReveal && ref
            ? { target: ref, offset: ["start end", "end start"] }
            : undefined
    ).scrollYProgress

    const safeScrollStart = React.useMemo(
        () => Math.min(scrollStart, scrollEnd),
        [scrollStart, scrollEnd]
    )
    const safeScrollEnd = React.useMemo(
        () => Math.max(scrollStart, scrollEnd),
        [scrollStart, scrollEnd]
    )

    const scrollProgress = useTransform(
        scrollYProgress,
        [safeScrollStart, safeScrollEnd],
        [0, 1],
        { clamp: true }
    )

    const startRevealed = noReveal || revealMode === "revealed"
    const inViewProgress = useMotionValue(startRevealed ? 1 : 0)
    const scaleProgress = useMotionValue(startRevealed ? 1 : 0)

    React.useEffect(() => {
        if (isStatic || noReveal || revealMode === "revealed") {
            inViewProgress.set(1)
            scaleProgress.set(1)
            return
        }

        if (revealMode === "inView") {
            if (shouldAnimateInView) {
                const revealControls = animate(inViewProgress.get(), 1, {
                    ...transition,
                    onUpdate: (v) => inViewProgress.set(v),
                })
                const scaleControls = animate(scaleProgress.get(), 1, {
                    ...transition,
                    onUpdate: (v) => scaleProgress.set(v),
                })
                return () => {
                    revealControls.stop()
                    scaleControls.stop()
                }
            }
            if (!once) {
                inViewProgress.set(0)
                scaleProgress.set(0)
            }
        }
    }, [
        inViewProgress,
        isStatic,
        noReveal,
        once,
        revealMode,
        transition,
        scaleProgress,
        shouldAnimateInView,
    ])

    const currentMaskProgress =
        revealMode === "scroll" ? scrollProgress : inViewProgress
    const currentScaleProgress =
        revealMode === "scroll" ? scrollProgress : scaleProgress

    // ===============================================================
    // CLIP-PATH LOGIC
    // ===============================================================
    const insetTop = useTransform(currentMaskProgress, (p) => {
        if (direction === "top") return 0
        if (direction === "bottom") return (1 - p) * 100
        return 0
    })
    const insetRight = useTransform(currentMaskProgress, (p) => {
        if (direction === "right") return 0
        if (direction === "left") return (1 - p) * 100
        return 0
    })
    const insetBottom = useTransform(currentMaskProgress, (p) => {
        if (direction === "bottom") return 0
        if (direction === "top") return (1 - p) * 100
        return 0
    })
    const insetLeft = useTransform(currentMaskProgress, (p) => {
        if (direction === "left") return 0
        if (direction === "right") return (1 - p) * 100
        return 0
    })

    const insetClipPath = useMotionTemplate`inset(${insetTop}% ${insetRight}% ${insetBottom}% ${insetLeft}%)`

    const diagDirectionMap = React.useMemo(
        () => ({
            "top-left-to-bottom-right": { start: [0, 0] },
            "top-right-to-bottom-left": { start: [100, 0] },
            "bottom-left-to-top-right": { start: [0, 100] },
            "bottom-right-to-top-left": { start: [100, 100] },
        }),
        []
    )

    const diagStart = (diagDirectionMap as Record<string, { start: number[] }>)[
        direction
    ]?.start ?? [0, 100]
    const [rawStartX, rawStartY] = diagStart
    const rawEndX = 100 - rawStartX
    const rawEndY = 100 - rawStartY

    const halfInitial = React.useMemo(
        () => Math.max(1, Math.min(initialSize, 60)) / 2,
        [initialSize]
    )
    const adjustAnchorForInitialSquare = React.useCallback(
        (anchor: number) => {
            if (anchor === 0) return halfInitial
            if (anchor === 100) return 100 - halfInitial
            return 50
        },
        [halfInitial]
    )

    const startX = adjustAnchorForInitialSquare(rawStartX)
    const startY = adjustAnchorForInitialSquare(rawStartY)
    const endX = adjustAnchorForInitialSquare(rawEndX)
    const endY = adjustAnchorForInitialSquare(rawEndY)

    const diagSize = useTransform(
        currentMaskProgress,
        [0, 1],
        [initialSize, 260]
    )
    const diagCx = useTransform(currentMaskProgress, [0, 1], [startX, endX])
    const diagCy = useTransform(currentMaskProgress, [0, 1], [startY, endY])
    const diagLeft = useTransform(
        [diagCx, diagSize],
        ([x, s]: [number, number]) => x - s / 2
    )
    const diagRight = useTransform(
        [diagCx, diagSize],
        ([x, s]: [number, number]) => x + s / 2
    )
    const diagTop = useTransform(
        [diagCy, diagSize],
        ([y, s]: [number, number]) => y - s / 2
    )
    const diagBottom = useTransform(
        [diagCy, diagSize],
        ([y, s]: [number, number]) => y + s / 2
    )

    const diagClipPath = useMotionTemplate`polygon(${diagLeft}% ${diagTop}%, ${diagRight}% ${diagTop}%, ${diagRight}% ${diagBottom}%, ${diagLeft}% ${diagBottom}%)`

    const clipPath = isDiagonal ? diagClipPath : insetClipPath

    const imgScale = useTransform(currentScaleProgress, [0, 1], [scaleFrom, 1])

    // ===============================================================
    // RADIUS
    // ===============================================================
    const resolvedRadii = React.useMemo(() => {
        if (typeof radius === "number") {
            return {
                topLeft: radius,
                topRight: radius,
                bottomRight: radius,
                bottomLeft: radius,
            }
        }
        const fallback = radius?.radius ?? 0
        return {
            topLeft: radius?.topLeft ?? fallback,
            topRight: radius?.topRight ?? fallback,
            bottomRight: radius?.bottomRight ?? fallback,
            bottomLeft: radius?.bottomLeft ?? fallback,
        }
    }, [radius])

    // ===============================================================
    // BORDER
    // ===============================================================
    const borderOverlayStyles: React.CSSProperties = React.useMemo(() => {
        const b = (border ?? {}) as Record<string, any>
        const bw = b.borderWidth ?? b.borderTopWidth ?? 0
        if (!bw) return { display: "none" }
        return {
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            pointerEvents: "none",
            borderStyle: b.borderStyle ?? "solid",
            borderColor: b.borderColor ?? "#000000",
            borderWidth: b.borderWidth,
            borderTopWidth: b.borderTopWidth,
            borderRightWidth: b.borderRightWidth,
            borderBottomWidth: b.borderBottomWidth,
            borderLeftWidth: b.borderLeftWidth,
            borderTopLeftRadius: resolvedRadii.topLeft,
            borderTopRightRadius: resolvedRadii.topRight,
            borderBottomRightRadius: resolvedRadii.bottomRight,
            borderBottomLeftRadius: resolvedRadii.bottomLeft,
        }
    }, [border, resolvedRadii])

    // ===============================================================
    // STYLES
    // ===============================================================
    // Container has border-radius and owns the shadow (no clip-path issues).
    const containerStyles: React.CSSProperties = React.useMemo(
        () => ({
            width: "100%",
            height: "100%",
            position: "relative",
            borderTopLeftRadius: resolvedRadii.topLeft,
            borderTopRightRadius: resolvedRadii.topRight,
            borderBottomRightRadius: resolvedRadii.bottomRight,
            borderBottomLeftRadius: resolvedRadii.bottomLeft,
            backgroundColor: startRevealed
                ? "transparent"
                : placeholderBackground,
            ...style,
        }),
        [placeholderBackground, resolvedRadii, startRevealed, style]
    )

    // Mask clips the wipe content. Shadow lives on the container above.
    const maskStyles: React.CSSProperties = React.useMemo(
        () => ({
            width: "100%",
            height: "100%",
            position: "relative",
            borderTopLeftRadius: resolvedRadii.topLeft,
            borderTopRightRadius: resolvedRadii.topRight,
            borderBottomRightRadius: resolvedRadii.bottomRight,
            borderBottomLeftRadius: resolvedRadii.bottomLeft,
        }),
        [resolvedRadii]
    )

    const imageStyles: React.CSSProperties = React.useMemo(
        () => ({
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            pointerEvents: "none",
        }),
        []
    )

    // Animated shadow opacity — grows in as the reveal progresses.
    const shadowOpacity = useTransform(currentMaskProgress, [0.3, 1], [0, 1])

    // STATIC / NO-REVEAL / REVEALED: render a plain image.
    if (isStatic || startRevealed) {
        return (
            <div
                ref={ref}
                style={containerStyles}
                aria-label={image?.alt || "Image"}
                role="img"
            >
                {/* Shadow layer (static, fully shown) */}
                {shadowEnabled && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            boxShadow: shadow,
                            borderTopLeftRadius: resolvedRadii.topLeft,
                            borderTopRightRadius: resolvedRadii.topRight,
                            borderBottomRightRadius: resolvedRadii.bottomRight,
                            borderBottomLeftRadius: resolvedRadii.bottomLeft,
                            pointerEvents: "none",
                        }}
                    />
                )}
                <div style={{ ...maskStyles, overflow: "hidden" }}>
                    <motion.div
                        style={{ width: "100%", height: "100%", padding: imagePadding }}
                        whileHover={hoverEnabled ? { scale: hoverScale } : undefined}
                        transition={hoverTransition}
                    >
                        <img
                            src={image?.src}
                            srcSet={image?.srcSet}
                            alt={image?.alt || "Image"}
                            style={{ ...imageStyles, transform: "scale(1)" }}
                            draggable={false}
                        />
                    </motion.div>
                    <div style={borderOverlayStyles} />
                </div>
        </div>
    )
    }

    // ANIMATED REVEAL
    return (
        <div
            ref={ref}
            style={containerStyles}
            aria-label={image?.alt || "Image"}
            role="img"
        >
            {/* Animated shadow — fades in with the reveal, no clipPath so boxShadow extends naturally. */}
            {shadowEnabled && (
                <motion.div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                    }}
                >
                    <motion.div
                        style={{
                            width: "100%",
                            height: "100%",
                            opacity: shadowOpacity,
                            boxShadow: shadow,
                            borderTopLeftRadius: resolvedRadii.topLeft,
                            borderTopRightRadius: resolvedRadii.topRight,
                            borderBottomRightRadius: resolvedRadii.bottomRight,
                            borderBottomLeftRadius: resolvedRadii.bottomLeft,
                        }}
                    />
                </motion.div>
            )}

            {/* Image + border, clipped (wipe) and scaled (zoom). */}
            <motion.div
                style={{
                    ...maskStyles,
                    overflow: "hidden",
                    clipPath,
                    willChange: "clip-path",
                }}
            >
                <motion.div
                    style={{
                        width: "100%",
                        height: "100%",
                        scale: imgScale,
                        position: "relative",
                    }}
                >
                    <motion.div
                        style={{ width: "100%", height: "100%", padding: imagePadding }}
                        whileHover={hoverEnabled ? { scale: hoverScale } : undefined}
                        transition={hoverTransition}
                    >
                        <img
                            src={image?.src}
                            srcSet={image?.srcSet}
                            alt={image?.alt || "Image"}
                            style={imageStyles}
                            draggable={false}
                        />
                    </motion.div>
                    <div style={borderOverlayStyles} />
                </motion.div>
            </motion.div>
        </div>
    )
}

addPropertyControls(ImageReveal, {
    image: {
        type: ControlType.ResponsiveImage,
        title: "Image",
    },
    revealEnabled: {
        type: ControlType.Boolean,
        title: "Image Reveal",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
        description:
            "Turn off to render a plain image with no reveal, scale, or shadow animation.",
    },
    revealMode: {
        type: ControlType.Enum,
        title: "Trigger",
        options: ["inView", "scroll", "revealed"],
        optionTitles: ["Appear", "Scroll", "Revealed"],
        defaultValue: "inView",
        hidden: ({ revealEnabled }) => !revealEnabled,
    },
    direction: {
        type: ControlType.Enum,
        title: "Direction",
        options: [
            "bottom",
            "top",
            "left",
            "right",
            "bottom-left-to-top-right",
            "bottom-right-to-top-left",
            "top-left-to-bottom-right",
            "top-right-to-bottom-left",
        ],
        optionTitles: [
            "Bottom to Top",
            "Top to Bottom",
            "Left to Right",
            "Right to Left",
            "Bottom-Left to Top-Right",
            "Bottom-Right to Top-Left",
            "Top-Left to Bottom-Right",
            "Top-Right to Bottom-Left",
        ],
        defaultValue: "bottom",
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode === "revealed",
    },
    initialSize: {
        type: ControlType.Number,
        title: "Initial Size",
        description: "Starting square size (% of frame). Diagonal only.",
        defaultValue: 10,
        min: 2,
        max: 60,
        step: 1,
        unit: "%",
        hidden: ({ revealEnabled, revealMode, direction }) =>
            !revealEnabled ||
            revealMode === "revealed" ||
            !DIAGONAL_DIRECTIONS.includes(direction),
    },
    inViewAmount: {
        type: ControlType.Number,
        title: "Appear Amt",
        description:
            "How much of the element must be visible (0–1) to trigger the reveal.",
        defaultValue: 0.35,
        min: 0,
        max: 1,
        step: 0.01,
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode !== "inView",
    },
    scrollStart: {
        type: ControlType.Number,
        title: "Scroll Start",
        description: "Scroll progress (0–1) where the reveal begins.",
        defaultValue: 0.2,
        min: 0,
        max: 1,
        step: 0.01,
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode !== "scroll",
    },
    scrollEnd: {
        type: ControlType.Number,
        title: "Scroll End",
        description: "Scroll progress (0–1) where the reveal completes.",
        defaultValue: 0.6,
        min: 0,
        max: 1,
        step: 0.01,
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode !== "scroll",
    },
    transition: {
        type: ControlType.Transition,
        title: "Transition",
        defaultValue: {
            type: "tween",
            duration: 1.5,
            ease: [0.77, 0, 0.175, 1],
        },
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode !== "inView",
    },
    scaleFrom: {
        type: ControlType.Number,
        title: "Scale From",
        description: "Starting zoom level before scaling down to 1.0.",
        defaultValue: 1.3,
        min: 1,
        max: 2,
        step: 0.01,
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode === "revealed",
    },
    placeholderBackground: {
        type: ControlType.Color,
        title: "Placeholder",
        defaultValue: "#000000",
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode === "revealed",
    },
    once: {
        type: ControlType.Boolean,
        title: "Once",
        defaultValue: true,
        enabledTitle: "Once",
        disabledTitle: "Repeat",
        hidden: ({ revealEnabled, revealMode }) =>
            !revealEnabled || revealMode !== "inView",
    },
    shadowEnabled: {
        type: ControlType.Boolean,
        title: "Shadow",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    shadow: {
        type: ControlType.BoxShadow,
        title: "Shadow",
        defaultValue: "0px 10px 30px 0px rgba(0,0,0,0.25)",
        hidden: ({ shadowEnabled }) => !shadowEnabled,
    },
    radius: {
        type: ControlType.FusedNumber,
        title: "Radius",
        defaultValue: 0,
        toggleKey: "radiusPerCorner",
        toggleTitles: ["All", "Per Corner"],
        valueKeys: ["topLeft", "topRight", "bottomRight", "bottomLeft"],
        valueLabels: ["TL", "TR", "BR", "BL"],
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
    },
    border: {
        type: ControlType.Border,
        title: "Border",
        defaultValue: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "rgba(0, 0, 0, 0.5)",
        },
    },
    imagePadding: {
        type: ControlType.Padding,
        title: "Image Padding",
        defaultValue: "0px",
    },
    hoverEnabled: {
        type: ControlType.Boolean,
        title: "Hover Scale",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    hoverScale: {
        type: ControlType.Number,
        title: "Hover Scale",
        defaultValue: 1.05,
        min: 1,
        max: 1.5,
        step: 0.01,
        hidden: ({ hoverEnabled }) => !hoverEnabled,
    },
    hoverTransition: {
        type: ControlType.Transition,
        title: "Hover Transition",
        defaultValue: { type: "spring", stiffness: 300, damping: 20 },
        hidden: ({ hoverEnabled }) => !hoverEnabled,
    },
})
