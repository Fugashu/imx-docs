const { url } = require('../docusaurus.config');

module.exports = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Core SDK Golang',
      items: [
        'overview',
        'installation',
        'authentication',
        'quickstart',
        'workflows',
        'additional-info',
        {
          type: 'link',
          label: 'Examples',
          href: `https://github.com/immutable/imx-core-sdk-golang/tree/main/examples`,
        },
        {
          type: 'link',
          label: 'Api Client Reference',
          href: `${url}/sdk-references/core-sdk-golang/0-1-0/apiclient/`,
        },
      ],
    },
  ],
};
