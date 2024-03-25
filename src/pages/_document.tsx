import { Html, Head, Main, NextScript } from 'next/document'
import { useEffect, useState } from 'react'

export default function Document() {
  return (
    <Html lang="en" style={{height: '100%'}}>
      <Head />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* @ts-ignore */}
      <body style={{paddingRight: '0 !important'}} layout='full-width'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
