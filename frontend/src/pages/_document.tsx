import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    // Force server-side rendering by including getInitialProps
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="bg">
        <Head>
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icons/icon-144x144.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument