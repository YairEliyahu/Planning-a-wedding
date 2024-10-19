// import Image from 'next/image';
import Navbar from '../components/Navbar';
import './globals.css';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="background">
        <div className="overlay">
          <div className="content"></div>
        </div>
      </div>
    </>
  );
}
