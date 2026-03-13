

interface BlinkIconProps {
    className?: string;
}

export function BlinkIcon({ className = "" }: BlinkIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer stylized guard shape */}
            <path
                d="M12 21.5C12 21.5 2 12 2 12C2 12 5 4.5 12 4.5C19 4.5 22 12 22 12C22 12 12 21.5 12 21.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
            />
            {/* Main Eye Shape */}
            <path
                d="M3 12C3 12 7 6 12 6C17 6 21 12 21 12C21 12 17 18 12 18C7 18 3 12 3 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Pupil */}
            <circle
                cx="12"
                cy="12"
                r="3"
                fill="currentColor"
            />
            {/* Lens/Reflection Detail */}
            <path
                d="M10.5 10.5C10.5 10.5 11 10.2 11.5 10.5"
                stroke="white"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.8"
            />
        </svg>
    );
}
