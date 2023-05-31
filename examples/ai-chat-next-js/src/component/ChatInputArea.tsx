export const ChatInputArea: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        height: "160px",
        width: "100%",
        backgroundImage:
          "linear-gradient(to bottom, transparent, #1A2439, #1A2439)",
      }}
    >
      <div
        style={{
          maxWidth: "768px",
          position: "relative",
          margin: "0 auto",
          bottom: "-80px",
        }}
      >
        {children}
      </div>
    </div>
  );
};
