export default function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="gradient-btn"
    >
      {text}
    </button>
  );
}
