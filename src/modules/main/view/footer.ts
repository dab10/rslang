import logoImage from '../../../images/rs_school_js.svg';
import gitHubImage from '../../../images/git_hub.svg';

export const removeFooter = () => {
    const footer = document.querySelector('footer');
    while (footer.lastChild) footer.lastChild.remove();
};
export const renderFooter = () => {
    const footer = document.querySelector('footer');
    removeFooter();
    footer.innerHTML = `
    <ul class="footer__list nav">
    <li class="footer__list-item logo nav-item">
      <a class="nav-link" href="https://rs.school/js/"><span 
          alt="rs-school logo" class="logo_image">
        </span></a>
    </li>
    <li class="footer__list-item nav-item">
      <a class="git-link nav-link" target="_blank" href="https://github.com/dab10"><span class="git-hub_svg"></span>Bazhenov Denis</a>
    </li>
    <li class="footer__list-item nav-item">
      <a class="git-link nav-link" target="_blank" href="https://github.com/labatsevich"><span class="git-hub_svg"></span>Yuri Labatsevich</a>
    </li>
    <li class="footer__list-item nav-item">
      <a class="git-link nav-link" target="_blank" href="https://github.com/elem15"><span class="git-hub_svg"></span>Mikhail Dvorkin</a>
    </li>
    <li class="footer__list-item">
      Year 2022
    </li>
  </ul>
  `;
    const RSSchoolLogo = document.querySelector('.logo_image') as HTMLElement;
    RSSchoolLogo.innerHTML = logoImage;
    const linksToGit = document.querySelectorAll('.git-hub_svg') as NodeListOf<HTMLElement>;
    linksToGit.forEach((link) => {
        link.insertAdjacentHTML('afterbegin', gitHubImage);
    });
};
