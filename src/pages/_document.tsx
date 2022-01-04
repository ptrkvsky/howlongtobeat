import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  onLoad() {
    document.getElementById(`font1`)?.setAttribute(`media`, `all`);
  }

  render() {
    return (
      <Html>
        <Head>
          <meta name="google-site-verification" content="JToiALKPVzracQqpHh9U1OEf0n1wkC9Z8VaRsUmSboo" />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
