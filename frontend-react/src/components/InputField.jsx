export default function InputField({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder = "", 
  name, 
  className = "", 
  style = {} 
}) {
  return (
    <div style={{ marginBottom: "1.2rem", width: "100%" }}>
      {label && (
        <label 
          style={{ color: "#fff", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`transparent-input ${className}`}
        style={{ ...style, padding: "0.5rem", borderRadius: "10px", border: "1px solid #ccc" }}
      />
    </div>
  );
}
