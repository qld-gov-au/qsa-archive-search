import angular from 'angular';

/*
 * An attribute that blurs the element when focused
 */
let qsaNoFocus = () => {
    return {
        restrict: 'A',
        link: (scope, elem, attrs) => {
            elem.bind('focus', () => {
                elem.blur();
            })
        }
    }
}

export default angular.module('directives.qsaNoFocus', [])
    .directive('qsaNoFocus', qsaNoFocus)
    .name;