import { createElement } from 'preact';
import { useMemo } from 'preact/hooks';
import propTypes from 'prop-types';

import { isThirdPartyUser } from '../util/account-id';
import { withServices } from '../util/service-context';

/** @typedef {import('../../types/api').Annotation} Annotation */

/**
 * @typedef TagListProps
 * @prop {Annotation} annotation - Annotation that owns the tags.
 * @prop {string[]} tags - List of tags as strings.
 * @prop {(a: string, b: Object<'tag', string>) => any} serviceUrl - Services
 * @prop {{ authDomain: string }} settings
 * @prop {Object} nanopubs -> nanopubs Service
 */

/**
 * Component to render an annotation's tags.
 * @param {TagListProps} props
 */
function TagList({ annotation, serviceUrl, settings, tags, nanopubs }) {
  const renderLink = useMemo(
    // Show a link if the authority of the user is not 3rd party
    () => !isThirdPartyUser(annotation.user, settings.authDomain),
    [annotation, settings]
  );

  /**
   * Returns a uri link for a specific tag name.
   * @param {string} tag
   * @return {string}
   */
  const createTagSearchURL = tag => {
    return serviceUrl('search.tag', { tag: tag });
  };

  return (
    <ul className="tag-list" aria-label="Annotation tags">
      {tags.map(tag => {
        let label = tag;
        let ontology = nanopubs.tools.ontologies.isOntologyTag(tag);
        if (ontology) {
          label = nanopubs.tools.ontologies.decodeOntologyTag(tag, false);
        }
        return { label, tag, ontology };
      }).map(tag => (
        <li key={tag.tag} className={'tag-list__item ' + (tag.ontology ? 'ontology' : '')} >
          {renderLink && (
            <a
              className="tag-list__link"
              href={createTagSearchURL(tag.tag)}
              lang=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Tag: ${tag.tag}`}
              title={`View annotations with tag: ${tag.label}`}
            >
              {tag.label}
            </a>
          )}
          {!renderLink && (
            <span className="tag-list__text" aria-label={`Tag: ${tag.tag}`} lang="">
              {tag.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

TagList.propTypes = {
  annotation: propTypes.object.isRequired,
  tags: propTypes.array.isRequired,
  serviceUrl: propTypes.func,
  settings: propTypes.object,
  nanopubs: propTypes.object
};

TagList.injectedProps = ['serviceUrl', 'settings', 'nanopubs'];

export default withServices(TagList);
