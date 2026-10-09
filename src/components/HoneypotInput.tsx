interface HoneypotProps {
  value: string;
  onChange: (val: string) => void;
}

export default function HoneypotInput({ value, onChange }: HoneypotProps) {
  return (
    <div
      style={{
        opacity: 0,
        position: "absolute",
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <label htmlFor="website_url_hp">Leave this field blank</label>
      <input
        type="text"
        id="website_url_hp"
        name="website_url_hp"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
