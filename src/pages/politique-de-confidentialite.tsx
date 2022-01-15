import Layout from '@/components/layouts/front/LayoutFront';
import { HomeTitle } from '@/styles/components/titles';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

const Wrapper = styled(`div`)`
  max-width: 800px;

  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: ${({ theme }) => theme.spacing[`5`]};
    margin-bottom: ${({ theme }) => theme.spacing[`4`]};
    font-size: ${({ theme }) => theme.typography.fontSizes[`4xl`]};
  }

  ul,
  p {
    margin-top: ${({ theme }) => theme.spacing[`2.5`]};
    margin-bottom: ${({ theme }) => theme.spacing[`2`]};
  }
`;

const Politique = () => {
  const [mail, setMail] = useState<string>(`vincent.crtd@gmail.com`);

  useEffect(() => {
    setMail(`johan@developpeur-web.tech`);
  }, []);

  return (
    <Layout isCentered>
      <Wrapper>
        <HomeTitle>Politique de confidentialité</HomeTitle>
        <p>
          Le site web game-over.io est détenu par game-over.io, qui est un
          contrôleur de données de vos données personnelles.
        </p>

        <p>
          Nous avons adopté cette politique de confidentialité, qui détermine la
          manière dont nous traitons les informations collectées par
          game-over.io, qui fournit également les raisons pour lesquelles nous
          devons collecter certaines données personnelles vous concernant. Par
          conséquent, vous devez lire cette politique de confidentialité avant
          d&apos;utiliser le site web de game-over.io.
        </p>

        <p>
          Nous prenons soin de vos données personnelles et nous nous engageons à
          en garantir la confidentialité et la sécurité.
        </p>

        <h2>Les informations personnelles que nous collectons : </h2>
        <p>
          Lorsque vous visitez le game-over.io, nous recueillons automatiquement
          certaines informations sur votre appareil, notamment des informations
          sur votre navigateur web, votre adresse IP, votre fuseau horaire et
          certains des cookies installés sur votre appareil. En outre, lorsque
          vous naviguez sur le site, nous recueillons des informations sur les
          pages web ou les produits individuels que vous consultez, sur les
          sites web ou les termes de recherche qui vous ont renvoyé au site et
          sur la manière dont vous interagissez avec le site. Nous désignons ces
          informations collectées automatiquement par le terme
          &quot;informations sur les appareils&quot;. En outre, nous pourrions
          collecter les données personnelles que vous nous fournissez (y
          compris, mais sans s&apos;y limiter, le nom, le prénom,
          l&apos;adresse, les informations de paiement, etc.) lors de
          l&apos;inscription afin de pouvoir exécuter le contrat.
        </p>

        <h2>Pourquoi traitons-nous vos données ?</h2>
        <p>
          Notre priorité absolue est la sécurité des données des clients et, à
          ce titre, nous ne pouvons traiter que des données minimales sur les
          utilisateurs, uniquement dans la mesure où cela est absolument
          nécessaire pour maintenir le site web. Les informations collectées
          automatiquement sont utilisées uniquement pour identifier les cas
          potentiels d&apos;abus et établir des informations statistiques
          concernant l&apos;utilisation du site web. Ces informations
          statistiques ne sont pas autrement agrégées de manière à identifier un
          utilisateur particulier du système.
        </p>

        <p>
          Vous pouvez visiter le site web sans nous dire qui vous êtes ni
          révéler d&apos;informations, par lesquelles quelqu&apos;un pourrait
          vous identifier comme un individu spécifique et identifiable.
          Toutefois, si vous souhaitez utiliser certaines fonctionnalités du
          site web, ou si vous souhaitez recevoir notre lettre
          d&apos;information ou fournir d&apos;autres détails en remplissant un
          formulaire, vous pouvez nous fournir des données personnelles, telles
          que votre e-mail, votre prénom, votre nom, votre ville de résidence,
          votre organisation, votre numéro de téléphone. Vous pouvez choisir de
          ne pas nous fournir vos données personnelles, mais il se peut alors
          que vous ne puissiez pas profiter de certaines fonctionnalités du site
          web. Par exemple, vous ne pourrez pas recevoir notre bulletin
          d&apos;information ou nous contacter directement à partir du site web.
          Les utilisateurs qui ne savent pas quelles informations sont
          obligatoires sont invités à nous contacter via {mail}.
        </p>

        <h2>Vos droits :</h2>
        <p>
          Si vous êtes un résident européen, vous disposez des droits suivants
          liés à vos données personnelles :
        </p>
        <ul>
          <li>Le droit d&apos;être informé.</li>
          <li>Le droit d&apos;accès.</li>
          <li>Le droit de rectification.</li>
          <li>Le droit à l&apos;effacement.</li>
          <li>Le droit de restreindre le traitement.</li>
          <li>Le droit à la portabilité des données.</li>
          <li>Le droit d&apos;opposition.</li>
          <li>
            Les droits relatifs à la prise de décision automatisée et au
            profilage.
          </li>
          <li>
            Si vous souhaitez exercer ce droit, veuillez nous contacter via les
            coordonnées ci-dessous.
          </li>
        </ul>

        <p>
          En outre, si vous êtes un résident européen, nous notons que nous
          traitons vos informations afin d&apos;exécuter les contrats que nous
          pourrions avoir avec vous (par exemple, si vous passez une commande
          par le biais du site), ou autrement pour poursuivre nos intérêts
          commerciaux légitimes énumérés ci-dessus. En outre, veuillez noter que
          vos informations pourraient être transférées en dehors de
          l&apos;Europe, y compris au Canada et aux États-Unis.
        </p>

        <h2>Liens vers d&apos;autres sites web :</h2>
        <p>
          Notre site web peut contenir des liens vers d&apos;autres sites web
          qui ne sont pas détenus ou contrôlés par nous. Sachez que nous ne
          sommes pas responsables de ces autres sites web ou des pratiques de
          confidentialité des tiers. Nous vous encourageons à être attentif
          lorsque vous quittez notre site web et à lire les déclarations de
          confidentialité de chaque site web susceptible de collecter des
          informations personnelles.
        </p>

        <h2>Sécurité de l&apos;information :</h2>
        <p>
          Nous sécurisons les informations que vous fournissez sur des serveurs
          informatiques dans un environnement contrôlé et sécurisé, protégé
          contre tout accès, utilisation ou divulgation non autorisés. Nous
          conservons des garanties administratives, techniques et physiques
          raisonnables pour nous protéger contre tout accès, utilisation,
          modification et divulgation non autorisés des données personnelles
          sous son contrôle et sa garde. Toutefois, aucune transmission de
          données sur Internet ou sur un réseau sans fil ne peut être garantie.
        </p>

        <h2>Divulgation légale :</h2>
        <p>
          Nous divulguerons toute information que nous collectons, utilisons ou
          recevons si la loi l&apos;exige ou l&apos;autorise, par exemple pour
          nous conformer à une citation à comparaître ou à une procédure
          judiciaire similaire, et lorsque nous pensons de bonne foi que la
          divulgation est nécessaire pour protéger nos droits, votre sécurité ou
          celle d&apos;autrui, enquêter sur une fraude ou répondre à une demande
          du gouvernement.
        </p>

        <h2>Informations de contact :</h2>
        <p>
          Si vous souhaitez nous contacter pour comprendre davantage la présente
          politique ou si vous souhaitez nous contacter concernant toute
          question relative aux droits individuels et à vos informations
          personnelles, vous pouvez envoyer un courriel à {mail}.
        </p>
      </Wrapper>
    </Layout>
  );
};

export default Politique;
