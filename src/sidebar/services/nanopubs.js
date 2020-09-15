/** @typedef {import('../../types/api').Annotation} Annotation */

/**
 * contiene las configuraciones para la api de nanopublicaciones
 *
 * @typedef NanoPubApiConfig
 * @prop {string} [apiUrl] url de la api
 * @prop {string[]} [ontologies] grupo de ontologias permitidas
 * @prop {string[]} [tags] tags permitidas 
 */

/**
 * a service for registration of annotations to nanopubs
 */
// @ngInject
export default function nanoPubs(settings) {

    const JsonHeaders = {
        'Content-Type': 'application/json'
    };

    /**
     * @type {NanoPubApiConfig}
     */
    const default_config = {
        apiUrl: 'http://localhost:8080/api',
        ontologies: ['ERO', 'SP', 'CHEBI', 'OBI', 'BAO', 'NCBITAXON', 'UBERON', 'EFO'],
        tags: ['step', 'sample', 'reagent', 'equipment', 'input', 'output'],
    }

    function getJSON(url) {
        return fetch(url).then(response => {
            if (response.status !== 200) {
                throw new Error(`Fetching ${url} failed`);
            }
            return response.json();
        });
    }

    /**
     * configuracion de las nanopublicaciones
     * @returns {NanoPubApiConfig}
     */
    function config() {
        return default_config;
    }

    /**
     * realiza el formateo de la annotacion pasada a un formato para
     * realizar la nanopublicacion
     * @param {Annotation} annotation 
     */
    function formatAnnotation(annotation) {
        if (annotation) {
            const annotationSelector = annotation.target[0].selector;
            const textQuoteSelector = annotationSelector?.filter(args => args.type == 'TextQuoteSelector')[0];
            const textPositionSelector = annotationSelector?.filter(args => args.type == 'TextPositionSelector')[0];
            return {
                id: annotation.id,
                authority: annotation.group,
                url: annotation.uri,
                created: annotation.created,
                updated: annotation.updated,
                title: annotation.document.title,
                refs: [],
                isReply: false,
                isPagenote: false,
                user: annotation.user,
                displayName: annotation['user_info'] ? annotation['user_info'].display_name : null,
                text: annotation.text,
                prefix: textQuoteSelector?.['prefix'],
                exact: textQuoteSelector?.['exact'],
                suffix: textQuoteSelector?.['suffix'],
                start: textPositionSelector?.['start'],
                end: textPositionSelector?.['end'],
                tags: annotation.tags,
                group: annotation.group,
                ontologies: annotation.tags.filter(isOntologyTag).map(tag => decodeOntologyTag(tag, false))
            }
        }
        return null;
    }

    /**
     * realiza la publicacion de las annotaciones
     * para su procesamiento en nanopublicaciones
     * @param {Annotation[]} annotations 
     */
    function publish(annotations) {
        const formatedAnnotaions = annotations.map(annotation => formatAnnotation(annotation));
        return fetch(apiUrl('nanopub/rgs'), {
            body: JSON.stringify(formatedAnnotaions),
            headers: JsonHeaders,
            method: 'POST'
        })
            .then(response => response.json())
            .then(response => {
                response.forEach(nanopub => {
                    console.log(nanopub.rdf)
                })
                return response;
            })
    }

    /**
     * 
     * @param {Annotation[]} annotations 
     */
    function preview(annotations) {
        const formatedAnnotaions = annotations.map(annotation => formatAnnotation(annotation));
        return fetch(apiUrl('nanopub/preview'), {
            body: JSON.stringify(formatedAnnotaions),
            headers: JsonHeaders,
            method: 'POST'
        })
            .then(response => response.json())
            .then(response => {
                response.forEach(nanopub => {
                    console.log(nanopub.rdf)
                })
                return response;
            });
    }

    //============= API =============

    /**
     * genera una url basada en la url de acceso a la api
     * @param {string} url url a consultar basada en la api
     */
    function apiUrl(url) {
        return `${config().apiUrl}/${url}`;
    }

    //============= TOOLS =============

    /**
     * codifica la tag en un formato de tag de ontologia ('_tag_')
     * @example 'CHEBI' => '_CHEBI_'
     * @param {string} tag tag a evaluar
     */
    function encodeOntologyTag(tag) {
        return tag ? `_${tag}_` : tag;
    }

    /**
     * decodifica una tag de ontologia('_X_') a un tag en formato comun
     * @example '_CHEBI_' => 'CHEBI'
     * @param {string} tag tag a evaluar
     * @param {boolean} _eval determina si se evalua si la etiqueta es un tag de ontologia #isTagOntologie -> default true
     */
    function decodeOntologyTag(tag, _eval = true) {
        return !_eval || isOntologyTag(tag) ? tag.substring(1, tag.length - 1) : tag;
    }

    /**
     * determina si la etiqueta pasada es una ontolgia
     * @param {string} tag etiqueta a evaluar
     */
    function isOntologyTag(tag) {
        return tag && tag.startsWith('_') && tag.endsWith('_');
    }

    return {
        config,
        publish,
        preview,
        tools: {
            ontologies: { encodeOntologyTag, decodeOntologyTag, isOntologyTag }
        }
    }
}