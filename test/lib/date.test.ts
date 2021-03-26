import {expect, test} from '@oclif/test'

import { dateStr, valiDate } from '../../src/lib/date';

describe('date', () => {
  describe('#dateStr', () => {
    it('should work', () => {
      expect(dateStr(new Date("2021-05-03"))).to.equal("2021-05-03")
      expect(dateStr(new Date("26 March 2021"))).to.equal("2021-03-26")
    });
  })
})