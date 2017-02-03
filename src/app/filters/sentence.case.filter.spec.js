import sentenceCase from './sentence.case.filter';

describe('sentenceCase', () => {
    let $filter;

    beforeEach(() => {
        angular.mock.module(sentenceCase);

        angular.mock.inject((_$filter_) => {
            $filter = _$filter_;
        });
    });

    it('returns a string in sentence case format', () => {
        let sentenceCase = $filter('sentenceCase');
        let input = 'qUeeNSlAnd goVerNMENT';
        let expected = 'Queensland government';

        expect(sentenceCase(input)).toEqual(expected);
    });

    it('returns an empty string if the input is an empty string', () => {
        let sentenceCase = $filter('sentenceCase');
        let input = '';
        let expected = '';

        expect(sentenceCase(input)).toEqual(expected);
    });
});