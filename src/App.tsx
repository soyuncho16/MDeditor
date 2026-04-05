import { AppLayout } from "./components/layout/AppLayout";
import "./App.css";

function App() {
  return (
    <AppLayout
      sidebar={<div style={{ padding: 12 }}>사이드바 (구현 예정)</div>}
      editor={<div style={{ padding: 12 }}>에디터 (구현 예정)</div>}
      preview={<div style={{ padding: 12 }}>프리뷰 (구현 예정)</div>}
    />
  );
}

export default App;
