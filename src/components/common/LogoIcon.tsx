import { Box, useToken } from "@chakra-ui/react";

export const LogoIcon = ({ size = "128px" }: { size?: string | number }) => {
  const [resolvedSize] = useToken("sizes", size.toString(), size.toString());

  return (
    <Box width={resolvedSize} height={resolvedSize}>
      <svg
        fill="none"
        height="100%"
        width="100%"
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <linearGradient
          id="a"
          gradientUnits="userSpaceOnUse"
          x1="111.125"
          x2="19.5625"
          y1="108.875"
          y2="17.3125"
        >
          <stop offset="0" stop-color="#2e6d9e" />
          <stop offset="1" stop-color="#b6fdfb" />
        </linearGradient>
        <linearGradient
          id="b"
          gradientUnits="userSpaceOnUse"
          x1="96.8125"
          x2="48.1875"
          y1="113"
          y2="64.375"
        >
          <stop offset="0" stop-color="#5493bf" />
          <stop offset="1" stop-color="#f1ffff" />
        </linearGradient>
        <linearGradient
          id="c"
          gradientUnits="userSpaceOnUse"
          x1="106"
          x2="3.625"
          y1="117.625"
          y2="15.25"
        >
          <stop offset=".154073" stop-color="#5493bf" stop-opacity="0" />
          <stop offset=".619161" stop-color="#f1ffff" />
        </linearGradient>
        <linearGradient
          id="d"
          gradientUnits="userSpaceOnUse"
          x1="45.1833"
          x2="86.693"
          y1="44.5097"
          y2="86.4213"
        >
          <stop offset="0" stop-color="#f2ffff" />
          <stop offset="1" stop-color="#3271a1" />
        </linearGradient>
        <clipPath id="e">
          <path d="m0 0h128v128h-128z" />
        </clipPath>
        <clipPath id="f">
          <path d="m0 0h128v128h-128z" />
        </clipPath>
        <g clip-path="url(#e)">
          <g clip-path="url(#f)">
            <circle cx="64" cy="64" fill="url(#a)" r="64" />
            <path
              clip-rule="evenodd"
              d="m63.9375 121.75c31.8599 0 57.6875-25.8276 57.6875-57.6875s-25.8276-57.6875-57.6875-57.6875-57.6875 25.8276-57.6875 57.6875 25.8276 57.6875 57.6875 57.6875zm0-3.75c29.7889 0 53.9375-24.1486 53.9375-53.9375s-24.1486-53.9375-53.9375-53.9375-53.9375 24.1486-53.9375 53.9375 24.1486 53.9375 53.9375 53.9375z"
              fill="url(#b)"
              fill-rule="evenodd"
            />
            <path
              clip-rule="evenodd"
              d="m63.9375 128.125c35.3807 0 64.0625-28.6818 64.0625-64.0625s-28.6818-64.0625-64.0625-64.0625-64.0625 28.6818-64.0625 64.0625 28.6818 64.0625 64.0625 64.0625zm0-6.375c31.8599 0 57.6875-25.8276 57.6875-57.6875s-25.8276-57.6875-57.6875-57.6875-57.6875 25.8276-57.6875 57.6875 25.8276 57.6875 57.6875 57.6875z"
              fill="url(#c)"
              fill-rule="evenodd"
            />
            <path
              d="m64.0123 35.75-24.0985 13.6401-1.4138 28.907 26.6691 13.9529 23.4559-13.9529v-29.2824z"
              fill="url(#d)"
            />
            <path
              clip-rule="evenodd"
              d="m59.8646 34.3768c1.2386-.7139 2.6432-1.0897 4.0729-1.0897s2.8343.3758 4.0729 1.0897l.0052.003 19.7872 11.307.0097.0055c1.0139.5854 1.8872 1.3806 2.5633 2.329.1585.1552.2988.3343.4153.5357.101.1746.1785.3563.2335.5415.5672 1.1305.8647 2.3797.866 3.649v.0026 22.625.0025c-.0014 1.4303-.379 2.8351-1.0948 4.0734s-1.7446 2.2666-2.9833 2.9818l-.0097.0055-19.7872 11.307-.0056.0032c-1.2386.7138-2.643 1.0895-4.0725 1.0895s-2.8339-.3757-4.0725-1.0895l-.0056-.0032-19.7872-11.307-.0097-.0055c-1.2387-.7152-2.2675-1.7435-2.9833-2.9818s-1.0934-2.6431-1.0948-4.0734v-.0025-22.625-.0026c.0013-1.2695.2988-2.5188.8662-3.6495.055-.185.1325-.3666.2334-.541.1164-.2013.2566-.3802.415-.5354.6761-.9485 1.5495-1.7438 2.5635-2.3293l.0096-.0055h.0001l19.7872-11.307zm5.6607 4.3387 18.7572 10.7184-20.345 11.7688-20.3449-11.7689 18.7571-10.7183.0097-.0055c.4798-.2771 1.0241-.4229 1.5781-.4229s1.0983.1458 1.5781.4229zm-24.5409 36.6582v-21.6723l20.5156 11.8676v23.3551l-18.9375-10.8215-.004-.0023c-.4776-.2766-.8742-.6737-1.1505-1.1515-.2768-.4789-.4229-1.022-.4236-1.5751zm25.5156 13.4789 18.8125-10.75.004-.0023c.4776-.2766.8742-.6737 1.1505-1.1515.2769-.4792.4231-1.0228.4236-1.5763v-21.6711l-20.3906 11.7953z"
              fill="#306f9f"
              fill-rule="evenodd"
            />
          </g>
        </g>
      </svg>
    </Box>
  );
};
