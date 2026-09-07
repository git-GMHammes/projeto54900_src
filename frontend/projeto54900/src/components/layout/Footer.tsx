// Rodape simples.

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-top mt-auto py-3">
      <div className="container d-flex flex-wrap justify-content-between gap-2 text-body-secondary small">
        <span>projeto54900 &middot; MAPA / AGENDA / CHAT</span>
        <span>&copy; {year}</span>
      </div>
    </footer>
  );
}
