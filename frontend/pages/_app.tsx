// pages/_app.tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/frontend/public/web-favicon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}