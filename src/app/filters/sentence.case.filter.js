import angular from 'angular';

/*
 * A filter that format a string with sentence case
 */
let sentenceCase = () => {
    return (text) => {
        return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    }
}

export default angular.module('filters.sentence.case', [])
    .filter('sentenceCase', sentenceCase)
    .name;