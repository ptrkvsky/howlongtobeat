import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { completionOutcome, films, lengthLabel, rankLabel } from './verdict';

describe(`lengthLabel`, () => {
  it(`names the main story length`, () => {
    assert.equal(lengthLabel(10), `Vite terminé`);
    assert.equal(lengthLabel(11), `Durée raisonnable`);
    assert.equal(lengthLabel(30), `Durée raisonnable`);
    assert.equal(lengthLabel(60), `Gros morceau`);
    assert.equal(lengthLabel(61), `Marathon`);
  });

  it(`says nothing without a main story time`, () => {
    assert.equal(lengthLabel(0), null);
  });
});

describe(`completionOutcome`, () => {
  it(`speaks only of the clear cases`, () => {
    assert.equal(completionOutcome(24.9), `peu de joueurs voient la fin`);
    assert.equal(completionOutcome(25), null);
    assert.equal(completionOutcome(50), `la plupart des joueurs le terminent`);
    assert.equal(completionOutcome(null), null);
  });
});

describe(`rankLabel`, () => {
  it(`compares from the side most games are on`, () => {
    assert.equal(
      rankLabel({ longerThan: 96, shorterThan: 3 }),
      `Plus long que 96 % des jeux du catalogue`,
    );
    assert.equal(
      rankLabel({ longerThan: 10, shorterThan: 85 }),
      `Plus court que 85 % des jeux du catalogue`,
    );
    assert.equal(rankLabel({ longerThan: 45, shorterThan: 45 }), null);
    assert.equal(rankLabel(null), null);
  });
});

describe(`films`, () => {
  it(`counts two hour films from three`, () => {
    assert.equal(films(40), 20);
    assert.equal(films(5), 3);
    assert.equal(films(4), null);
    assert.equal(films(0), null);
  });
});
