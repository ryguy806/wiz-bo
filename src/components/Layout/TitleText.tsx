const DURATION = 4.4; // seconds, keep in sync with the config
const STAGGER = 0.5; // seconds of lag between adjacent letters

type TitleTextProps = { className?: string, text: string }

const TitleText =({ className = "", text }: TitleTextProps) => {
  return (
    <span className={className} aria-label="Wiz-Bo" role="img">
      {text.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block animate-wiz-cycle motion-reduce:animate-none"
          style={{
            // Negative delay: every letter is already mid-cycle on load,
            // and each letter lags the previous one, so the wave moves L→R.
            animationDelay: `${-DURATION + i * STAGGER}s`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default TitleText