import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Gallery from '../components/Gallery';
import Videos from '../components/Videos';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <Hero />
      <About />
      <Skills />
      <Gallery />
      <Videos />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;