import './App.css';
import Navbar from './components/nav/Navbar';
import CustomRoutes from './routes/CustomRoutes';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <CustomRoutes />
      </main>
    </div>
  );
}

export default App;
