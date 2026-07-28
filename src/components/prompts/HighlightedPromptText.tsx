interface HighlightedPromptTextProps {
  content: string;
}

export function HighlightedPromptText({
  content,
}: HighlightedPromptTextProps) {
  return content.split(/(\{\{[^}]+\}\})/g).map((part, index) =>
    part.startsWith("{{") ? (
      <mark key={`${part}-${index}`}>{part}</mark>
    ) : (
      part
    )
  );
}
