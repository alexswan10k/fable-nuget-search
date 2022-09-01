import * as React from 'react';
import { Search } from './Search';
import './style.css';

export default function App() {
  return (
    <div className="column is-9-desktop is-full-touch">
      <div className="section">
        <link
          rel="stylesheet"
          type="text/css"
          href="https://fable.io/style.css"
        />
        <Search />
      </div>
    </div>
  );
}
