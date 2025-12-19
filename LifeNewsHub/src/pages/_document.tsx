import { getLang } from "@/utils";
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/dist/pages/_document";

interface IProps extends DocumentInitialProps {
  lang: string;
}

export default class CusmDocument extends Document<IProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<IProps> {
    const lang = getLang(ctx.req?.headers['accept-language'])
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      lang: lang,
    };
  }

  render() {
    const { lang } = this.props;

    return (
      <Html lang={lang}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

