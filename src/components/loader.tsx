export default function Loader() {
  return <span style={{
    background: '#000',
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}>
    <span style={{
      width: '30px',
      height: '30px',
      border: '5px solid #fff',
      borderBottomColor: 'transparent',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'rotation 1s linear infinite',
    }}>
      <style>{`@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </span>
  </span>
}