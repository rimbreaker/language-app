import { Suspense } from 'react';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { StateContextProvider } from '../contexts/StateContextProvider';
import { FirebaseContextProvider } from '../contexts/FireBaseContextProvider';
import { AuthContextProvider } from '../contexts/AuthContextProvider';
import '../util/i18n';


function MyApp({ Component, pageProps }: AppProps) {

  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <FirebaseContextProvider>
        <StateContextProvider>
          <AuthContextProvider>
            <MantineProvider theme={{ colorScheme: 'dark', fontFamily: "sans-serif", headings: { fontFamily: "sans-serif" } }} >
              <Component {...pageProps} />
            </MantineProvider>
          </AuthContextProvider>
        </StateContextProvider>
      </FirebaseContextProvider>
    </Suspense >
  )

}

export default MyApp
