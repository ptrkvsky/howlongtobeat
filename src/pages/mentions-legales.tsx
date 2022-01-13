import Layout from '@/components/layouts/front/LayoutFront';
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

const MentionsLegales = () => {
  const [mail, setMail] = useState<string>(`vincent.crtd@gmail.com`);

  useEffect(() => {
    setMail(`johan@developpeur-web.tech`);
  }, []);

  return (
    <Layout games={[]} isCentered>
      <Wrapper>
        <div className="ff-el-group" data-name="custom_html-4_12">
          <h2>
            <span id="lwptoc20">1 - Édition du site</span>
          </h2>

          <p>
            En vertu de{` `}
            <a
              href="https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000801164#LEGIARTI000042038977"
              target="_blank"
              rel="noreferrer noopener"
            >
              l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004
            </a>
            {` `}
            pour la confiance dans l&apos;économie numérique, il est précisé aux
            utilisateurs du site internet{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            {` `}
            l&apos;identité des différents intervenants dans le cadre de sa
            réalisation et de son suivi:
          </p>

          <p>
            <strong>Propriétaire du site : </strong>
            <span
              className="ff_dynamic_value"
              data-ref="nom_proprietaire"
              data-fallback=""
            >
              Johan Petrikovsky
            </span>
            {` `}- Contact :{` `}
            <span
              className="ff_dynamic_value"
              data-ref="e_mail_contact"
              data-fallback=""
            >
              {mail}
            </span>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="telephone"
              data-fallback=""
            >
              0615373596
            </span>
            {` `}- Adresse :{` `}
            <span
              className="ff_dynamic_value"
              data-ref="adresse_postale"
              data-fallback=""
            >
              51 avenue de lespinet 31400 toulouse
            </span>
            .
          </p>

          <p>
            <strong>Identification de l&apos;entreprise :</strong>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="forme_juridique"
              data-fallback=""
            ></span>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="nom_proprietaire"
              data-fallback=""
            >
              Johan Petrikovsky
            </span>
            {` `}
            au capital social de{` `}
            <span
              className="ff_dynamic_value"
              data-ref="capital_social"
              data-fallback=""
            ></span>
            € - SIREN :{` `}
            <span
              className="ff_dynamic_value"
              data-ref="siren"
              data-fallback=""
            ></span>
            {` `}- RCS ou RM :{` `}
            <span
              className="ff_dynamic_value"
              data-ref="rcs"
              data-fallback=""
            ></span>
            {` `}- Adresse postale :{` `}
            <span
              className="ff_dynamic_value"
              data-ref="adresse_postale"
              data-fallback=""
            >
              51 avenue de lespinet 31400 toulouse
            </span>
            {` `}-{` `}
            <span
              className="ff_dynamic_value"
              data-ref="cgv"
              data-fallback=""
            ></span>
            {` `}
          </p>

          <p>
            <strong>Directeur de la publication : </strong>
            <span
              className="ff_dynamic_value"
              data-ref="directeur_publication"
              data-fallback=""
            >
              Johan Petrikovsky
            </span>
            {` `}- Contact :{` `}
            <span
              className="ff_dynamic_value"
              data-ref="contact_directeur"
              data-fallback=""
            >
              {mail}
            </span>
            .
          </p>

          <p>
            <strong>Hébergeur :</strong>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="hebergeur"
              data-fallback=""
            >
              OVH SAS - 2 rue Kellermann - BP 80157 - 59053 Roubaix Cedex 1 -
              Téléphone : 1007
            </span>
            <span
              className="ff_dynamic_value"
              data-ref="nom_hebergeur"
              data-fallback=""
            ></span>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="adresse_hebergeur"
              data-fallback=""
            ></span>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="telephone_hebergeur"
              data-fallback=""
            ></span>
          </p>

          <p>
            <strong>Délégué à la protection des données : </strong>
            <span
              className="ff_dynamic_value"
              data-ref="dpo"
              data-fallback=""
            ></span>
            {` `}-{` `}
            <span
              className="ff_dynamic_value"
              data-ref="contact_dpo"
              data-fallback=""
            ></span>
          </p>

          <p>
            <strong>Autres contributeurs :</strong>
            {` `}
            <span
              className="ff_dynamic_value"
              data-ref="autres_contributeurs"
              data-fallback=""
            ></span>
          </p>

          <h2>
            <span id="lwptoc21">
              2 - Propriété intellectuelle et contrefaçons.
            </span>
          </h2>

          <p>
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            {` `}
            est propriétaire des droits de propriété intellectuelle et détient
            les droits d’usage sur tous les éléments accessibles sur le site
            internet, notamment les textes, images, graphismes, logos, vidéos,
            architecture, icônes et sons.
          </p>

          <p>
            Toute reproduction, représentation, modification, publication,
            adaptation de tout ou partie des éléments du site, quel que soit le
            moyen ou le procédé utilisé, est interdite, sauf autorisation écrite
            préalable de{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            .
          </p>

          <p>
            Toute exploitation non autorisée du site ou de l’un quelconque des
            éléments qu’il contient sera considérée comme constitutive d’une
            contrefaçon et poursuivie conformément aux dispositions des articles
            {` `}
            <a
              href="https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000032655082&amp;cidTexte=LEGITEXT000006069414&amp;dateTexte=20160605"
              target="_blank"
              rel="noreferrer nofollow noopener"
            >
              L.335-2 et suivants du Code de Propriété Intellectuelle
            </a>
            .
          </p>

          <h2>
            <span id="lwptoc22">3 - Limitations de responsabilité.</span>
          </h2>

          <p>
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            {` `}
            ne pourra être tenu pour responsable des dommages directs et
            indirects causés au matériel de l’utilisateur, lors de l’accès au
            site{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            .
          </p>

          <p>
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            {` `}
            décline toute responsabilité quant à l’utilisation qui pourrait être
            faite des informations et contenus présents sur{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            .
          </p>

          <p>
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            {` `}
            s’engage à sécuriser au mieux le site{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            , cependant sa responsabilité ne pourra être mise en cause si des
            données indésirables sont importées et installées sur son site à son
            insu.
          </p>

          <p>
            Des espaces interactifs (espace contact ou commentaires) sont à la
            disposition des utilisateurs.{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            {` `}
            se réserve le droit de supprimer, sans mise en demeure préalable,
            tout contenu déposé dans cet espace qui contreviendrait à la
            législation applicable en France, en particulier aux dispositions
            relatives à la protection des données.
          </p>

          <p>
            Le cas échéant,{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="nom_proprietaire"
                data-fallback=""
              >
                Johan Petrikovsky
              </span>
            </strong>
            {` `}
            se réserve également la possibilité de mettre en cause la
            responsabilité civile et/ou pénale de l’utilisateur, notamment en
            cas de message à caractère raciste, injurieux, diffamant, ou
            pornographique, quel que soit le support utilisé (texte,
            photographie …).
          </p>

          <h2>
            <span id="lwptoc23">
              4 - CNIL et gestion des données personnelles.
            </span>
          </h2>

          <p>
            Conformément aux dispositions de{` `}
            <a
              href="https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000886460"
              target="_blank"
              rel="noreferrer nofollow noopener"
            >
              la loi 78-17 du 6 janvier 1978 modifiée
            </a>
            , l’utilisateur du site{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            {` `}
            dispose d’un droit d’accès, de modification et de suppression des
            informations collectées. Pour exercer ce droit, envoyez un message à
            notre Délégué à la Protection des Données :{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="dpo"
                data-fallback=""
              ></span>
            </strong>
            {` `}-{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="contact_dpo"
                data-fallback=""
              ></span>
            </strong>
            .
          </p>

          <p>
            Pour plus d&apos;informations sur la façon dont nous traitons vos
            données (type de données, finalité, destinataire...), lisez notre
            {` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="politique_confidentialite"
                data-fallback=""
              >
                https://game-over.io/politique-de-confidentialite
              </span>
            </strong>
            .
          </p>

          <h2>
            <span id="lwptoc24">5 - Liens hypertextes et cookies</span>
          </h2>

          <p>
            Le site{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            {` `}
            contient des liens hypertextes vers d’autres sites et dégage toute
            responsabilité à propos de ces liens externes ou des liens créés par
            d’autres sites vers{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            .
          </p>

          <p>
            La navigation sur le site{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            {` `}
            est susceptible de provoquer l’installation de cookie(s) sur
            l’ordinateur de l’utilisateur.
          </p>

          <p>
            Un &quot;cookie&quot; est un fichier de petite taille qui enregistre
            des informations relatives à la navigation d’un utilisateur sur un
            site. Les données ainsi obtenues permettent d&apos;obtenir des
            mesures de fréquentation, par exemple.
          </p>

          <p>
            Vous avez la possibilité{` `}
            <strong>d’accepter ou de refuser les cookies</strong> en modifiant
            les paramètres de votre navigateur. Aucun cookie ne sera déposé sans
            votre consentement.
          </p>

          <p>
            Les cookies sont enregistrés pour une durée maximale de{` `}
            <span
              className="ff_dynamic_value"
              data-ref="cookies"
              data-fallback=""
            >
              12
            </span>
            {` `}
            mois.
          </p>

          <p>
            Pour plus d&apos;informations sur la façon dont nous faisons usage
            des cookies, lisez notre{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="politique_confidentialite"
                data-fallback=""
              >
                https://game-over.io/politique-de-confidentialite
              </span>
            </strong>
            .
          </p>

          <h2>
            <span id="lwptoc25">
              6 - Droit applicable et attribution de juridiction.
            </span>
          </h2>

          <p>
            Tout litige en relation avec l’utilisation du site{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="url"
                data-fallback=""
              >
                https://game-over.io
              </span>
            </strong>
            {` `}
            est soumis au droit français. En dehors des cas où la loi ne le
            permet pas, il est fait attribution exclusive de juridiction aux
            tribunaux compétents de{` `}
            <strong>
              <span
                className="ff_dynamic_value"
                data-ref="ville_du_tribunal"
                data-fallback=""
              >
                toulouse
              </span>
            </strong>
            .
          </p>
        </div>
      </Wrapper>
    </Layout>
  );
};

export default MentionsLegales;
