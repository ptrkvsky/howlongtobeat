import { useTheme } from '@emotion/react';
import CloakLink from '../Cloaklink';

const Logo = () => {
  const theme = useTheme();
  return (
    <CloakLink url="/">
      <svg
        width="210"
        height="62"
        viewBox="0 0 79 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.38 0.912C3.844 0.912 3.344 1.048 2.88 1.32C2.424 1.584 2.06 1.948 1.788 2.412C1.516 2.868 1.38 3.368 1.38 3.912V5.496C1.38 6.064 1.46 6.532 1.62 6.9C1.844 7.42 2.184 7.844 2.64 8.172C3.096 8.5 3.608 8.684 4.176 8.724V4.824H7.836V5.616C7.836 6.128 7.76 6.584 7.608 6.984C7.36 7.648 6.944 8.18 6.36 8.58C5.776 8.98 5.116 9.18 4.38 9.18C3.684 9.18 3.048 8.992 2.472 8.616C1.904 8.232 1.488 7.724 1.224 7.092C1.032 6.644 0.936 6.112 0.936 5.496V3.912C0.936 3.288 1.088 2.712 1.392 2.184C1.704 1.656 2.124 1.24 2.652 0.935999C3.18 0.624 3.756 0.468 4.38 0.468C4.9 0.468 5.376 0.556 5.808 0.732C6.24 0.9 6.608 1.148 6.912 1.476C7.16 1.748 7.36 2.052 7.512 2.388C7.672 2.724 7.752 3.064 7.752 3.408H7.32C7.312 3.112 7.236 2.82 7.092 2.532C6.956 2.244 6.78 1.984 6.564 1.752C6.028 1.192 5.3 0.912 4.38 0.912ZM7.392 5.256H4.608V8.724C5.184 8.684 5.7 8.504 6.156 8.184C6.62 7.856 6.96 7.424 7.176 6.888C7.32 6.512 7.392 6.088 7.392 5.616V5.256ZM17.2588 9H9.38681L13.3228 0.468L17.2588 9ZM10.0828 8.556H16.5628L13.3228 1.524L10.0828 8.556ZM18.8336 0.636H19.3136L22.2296 5.796L25.1336 0.636H25.5776V8.988H18.8336V0.636ZM19.2776 8.556H25.1336V1.536L22.4336 6.288H22.0136L19.2776 1.464V8.556ZM28.0884 0.648H34.1724V2.76H30.2724V3.816H33.5124V5.82H30.2724V6.888H34.1724V9H28.0884V0.648ZM45.3741 3.9C45.3741 3.276 45.5301 2.696 45.8421 2.16C46.1541 1.624 46.5741 1.2 47.1021 0.887999C47.6381 0.575999 48.2221 0.42 48.8541 0.42C49.4861 0.42 50.0661 0.575999 50.5941 0.887999C51.1301 1.2 51.5541 1.624 51.8661 2.16C52.1781 2.696 52.3341 3.276 52.3341 3.9V5.748C52.3341 6.372 52.1781 6.952 51.8661 7.488C51.5541 8.024 51.1301 8.448 50.5941 8.76C50.0661 9.072 49.4861 9.228 48.8541 9.228C48.2221 9.228 47.6381 9.072 47.1021 8.76C46.5741 8.448 46.1541 8.024 45.8421 7.488C45.5301 6.952 45.3741 6.372 45.3741 5.748V3.9ZM47.5581 5.748C47.5581 6.132 47.6781 6.46 47.9181 6.732C48.1581 7.004 48.4701 7.14 48.8541 7.14C49.2301 7.14 49.5381 7.004 49.7781 6.732C50.0181 6.46 50.1381 6.132 50.1381 5.748V3.888C50.1381 3.496 50.0181 3.168 49.7781 2.904C49.5381 2.64 49.2301 2.508 48.8541 2.508C48.4701 2.508 48.1581 2.64 47.9181 2.904C47.6781 3.168 47.5581 3.496 47.5581 3.888V5.748ZM53.8009 0.636H61.6729L57.7369 9.168L53.8009 0.636ZM57.7369 8.112L60.9889 1.08H54.4969L57.7369 8.112ZM63.6197 0.648H69.7037V2.76H65.8037V3.816H69.0437V5.82H65.8037V6.888H69.7037V9H63.6197V0.648ZM78.9585 9H72.5385V0.648H75.7905C76.4865 0.648 77.0545 0.772 77.4945 1.02C77.9265 1.26 78.2625 1.588 78.5025 2.004C78.7425 2.42 78.8625 2.88 78.8625 3.384C78.8625 4.008 78.6705 4.568 78.2865 5.064C77.9025 5.552 77.4185 5.876 76.8345 6.036L78.9585 9ZM73.2945 1.092L76.5585 5.652C77.0945 5.54 77.5385 5.272 77.8905 4.848C78.2425 4.424 78.4185 3.936 78.4185 3.384C78.4185 2.944 78.3105 2.544 78.0945 2.184C77.8785 1.824 77.5745 1.548 77.1825 1.356C76.8305 1.18 76.3705 1.092 75.8025 1.092H73.2945ZM72.9825 1.38V5.688H76.0665L72.9825 1.38ZM72.9825 8.556H78.1185L76.3665 6.12L75.9945 6.132H72.9825V8.556Z"
          fill={theme.colors.primary[500]}
        />
      </svg>
    </CloakLink>
  );
};

export default Logo;
