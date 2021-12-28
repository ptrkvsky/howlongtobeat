import styled from '@emotion/styled';
import { styleInformations } from '@/config/styleInformations';
import { breakpoints } from '@/styles/foundations';

const StyleFooter = styled(`footer`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${styleInformations.headerHeight.dekstop};

  ${breakpoints.tabletPortrait} {
    flex-direction: column;
  }
`;

export { StyleFooter };
