import { Routes, Route, Outlet, Link } from "react-router-dom";
import { Games } from "@/components/games";
import { GameDetails } from "@/components/game-details";
import { PlayGame } from "@/components/play-game";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="games" element={<Games />} />
          <Route path="games/:id" element={<GameDetails />} />
          <Route path="play/:id" element={<PlayGame />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold">Thrice</div>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              </li>
              <li>
                <Link to="/games" className="text-gray-600 hover:text-gray-900">Games</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          © {new Date().getFullYear()} Thrice - A trivia game where you get three clues
        </div>
      </footer>
    </div>
  );
}

function Home() {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-6">Welcome to Thrice</h1>
      <p className="text-xl mb-8">
        A challenging trivia game where you get three clues to guess the answer.
      </p>
      <Link
        to="/games"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Play Now
      </Link>
    </div>
  );
}

function NoMatch() {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold mb-4">Nothing to see here!</h2>
      <p className="mb-6">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Go to the home page
      </Link>
    </div>
  );
}
