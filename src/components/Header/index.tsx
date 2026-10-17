import styles from './header.module.css';

// Empty for now: the logo, search and dark mode toggle were disabled.
// Kept so the layout keeps its header row.
const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container"></div>
    </header>
  );
};

export default Header;
