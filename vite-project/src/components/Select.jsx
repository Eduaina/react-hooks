export default function SelectField({ placeholder, options, value, onSelect }) {
  return (
    <section className="select-wrapper">
      <select value={value} onChange={(e) => onSelect(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </section>
  );
}
