const DURATION = 5.4; // seconds, keep in sync with the config
const STAGGER = 0.1; // seconds of lag between adjacent letters

type TitleTextProps = { className?: string, text: string }

const TitleText =({ className = "", text }: TitleTextProps) => {
  return (
    <span className={className} aria-label={text} role="img">
      {text.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block animate-wiz-dance motion-reduce:animate-none"
          style={{ animationDelay: `${-DURATION + i * STAGGER}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default TitleText