<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ClipsTrack - sitemap</title>
        <style>
          body { margin: 0; background: #fafafa; color: #171717; font-family: Geist, Arial, Helvetica, sans-serif; }
          header { padding: 24px 32px; border-bottom: 1px solid #ebebeb; }
          header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.4px; }
          header p { margin: 4px 0 0; font-family: monospace; font-size: 12px; letter-spacing: 0; text-transform: uppercase; color: #8f8f8f; }
          table { width: 100%; max-width: 900px; margin: 24px 32px; border-collapse: collapse; }
          th { padding: 8px 12px; text-align: left; font-family: monospace; font-size: 12px; font-weight: 500; text-transform: uppercase; color: #8f8f8f; border-bottom: 1px solid #ebebeb; }
          td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #ebebeb; }
          td.url { white-space: normal; word-break: break-all; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <header>
          <h1>Sitemap</h1>
          <p>https://clipstrack.vercel.app</p>
        </header>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
              <th>Change frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="/sm:urlset/sm:url">
              <tr>
                <td class="url">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="sm:loc" />
                    </xsl:attribute>
                    <xsl:value-of select="sm:loc" />
                  </a>
                </td>
                <td>
                  <xsl:value-of select="substring-before(sm:lastmod, 'T')" />
                </td>
                <td>
                  <xsl:value-of select="sm:changefreq" />
                </td>
                <td>
                  <xsl:value-of select="sm:priority" />
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>