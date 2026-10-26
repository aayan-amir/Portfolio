import CompanyProcess from './CompanyProcess';
import { contributions } from '../data/contributions';
export default function ContributionLog() {
  return (
    <section className="work-log" aria-label="Contribution log">
      <CompanyProcess />
      <h3>What changed through my work</h3>
      <p>Backend Developer (Contract) · January–September 2026</p>
      {contributions.map((item) => (
        <details key={item.title}>
          <summary>
            {item.title}
            <small>{item.result}</small>
          </summary>
          <p>
            <strong>Before:</strong> {item.before}
          </p>
          <p>
            <strong>Contribution:</strong> {item.change}
          </p>
        </details>
      ))}
    </section>
  );
}
