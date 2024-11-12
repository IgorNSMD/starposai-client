import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Clients from './pages/customers/Clients';
import Products from './pages/products/Products';
import Categories from './pages/Categories/Categories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inventory/products" element={<Products />} />
          <Route path="inventory/categories" element={<Categories />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

//import './App.css'
// import RoutesConfig from './router/routes'

// function App() {

//   return (
//     <RoutesConfig /> 
//   )
// }

// export default App
