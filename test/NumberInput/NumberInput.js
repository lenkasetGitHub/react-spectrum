import assert from 'assert';
import Button from '../../src/Button';
import InputGroup from '../../src/InputGroup';
import NumberInput from '../../src/NumberInput';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Textfield from '../../src/Textfield';

describe('NumberInput', () => {
  it('default', () => {
    const assertDefaultButtonProps = (button, inputId) => {
      assert.equal(button.prop('type'), 'button');
      assert.equal(button.prop('aria-controls'), inputId);
      assert.equal(button.prop('variant'), 'secondary');
      assert.equal(button.prop('iconSize'), 'XS');
      assert.equal(button.prop('tabIndex'), '-1');
      assert.equal(button.prop('square'), true);
      assert.equal(button.prop('disabled'), false);
    };

    const tree = shallow(<NumberInput />);
    assert.equal(tree.hasClass('coral3-NumberInput'), true);
    assert.equal(tree.type(), InputGroup);

    const input = findInput(tree);
    const inputId = input.prop('id');
    assert(inputId);
    assert.equal(input.prop('defaultValue'), undefined);
    assert.equal(input.prop('role'), 'spinbutton');
    assert.equal(input.prop('aria-valuenow'), '');
    assert.equal(input.prop('aria-valuetext'), '');
    assert.equal(input.prop('step'), 1);
    assert.equal(input.prop('placeholder'), 'Enter a number');
    assert.equal(input.prop('disabled'), false);
    assert.equal(input.prop('readOnly'), false);
    assert.equal(input.prop('invalid'), false);
    assert.equal(input.hasClass('coral-InputGroup-input'), true);

    const decButton = findDecrementButton(tree);
    assertDefaultButtonProps(decButton, inputId);
    assert.equal(decButton.prop('title'), 'Decrement');

    const incButton = findIncrementButton(tree);
    assertDefaultButtonProps(incButton, inputId);
    assert.equal(incButton.prop('title'), 'Increment');

    const buttonWrappers = tree.find('.coral-InputGroup-button');
    assert.equal(buttonWrappers.at(0).prop('role'), 'presentation');
  });

  it('supports placeholder', () => {
    const tree = shallow(<NumberInput placeholder="foo" />);
    const input = findInput(tree);
    assert.equal(input.prop('placeholder'), 'foo');
  });

  it('supports decrementTitle', () => {
    const tree = shallow(<NumberInput decrementTitle="foo" />);
    const button = findDecrementButton(tree);
    assert.equal(button.prop('title'), 'foo');
  });

  it('supports incrementTitle', () => {
    const tree = shallow(<NumberInput incrementTitle="foo" />);
    const button = findIncrementButton(tree);
    assert.equal(button.prop('title'), 'foo');
  });

  it('supports readOnly', () => {
    const tree = shallow(<NumberInput readOnly />);
    const input = findInput(tree);
    assert.equal(input.prop('readOnly'), true);
    findAllButtons(tree).forEach(button => {
      assert.equal(button.prop('disabled'), true);
    });
  });

  it('supports disabled', () => {
    const tree = shallow(<NumberInput disabled />);
    const input = findInput(tree);
    assert.equal(input.prop('disabled'), true);
    findAllButtons(tree).forEach(button => {
      assert.equal(button.prop('disabled'), true);
    });
  });

  it('supports overriding id', () => {
    const tree = shallow(<NumberInput id="foo" />);
    assert.equal(findInput(tree).prop('id'), 'foo');
    findAllButtons(tree).forEach(wrapper => {
      assert.equal(wrapper.prop('aria-controls'), 'foo');
    });
  });

  describe('supports step', () => {
    let tree;
    let spy;
    let preventDefaultSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
      tree = shallow(<NumberInput step={0.5} onChange={spy} />);
    });

    it('adds prop to input', () => {
      assert.equal(findInput(tree).prop('step'), 0.5);
    });

    describe('calls change with proper stepped value', () => {
      it('when increment button is clicked', () => {
        findIncrementButton(tree).simulate('click', {preventDefault: preventDefaultSpy});
        assert(spy.calledWith(0.5));
        assert(preventDefaultSpy.called);
      });

      it('when decrement button is clicked', () => {
        findDecrementButton(tree).simulate('click', {preventDefault: preventDefaultSpy});
        assert(spy.calledWith(-0.5));
        assert(preventDefaultSpy.called);
      });

      describe('when mouse wheel is scrolled', () => {
        const simulateWheel = (deltaY = 5) => {
          findInput(tree).simulate('wheel', {deltaY, preventDefault: preventDefaultSpy});
        };

        it('up', () => {
          tree.setState({focused: true});
          simulateWheel(-4.5);
          assert(spy.calledWith(0.5));
          assert(preventDefaultSpy.called);
        });

        it('down', () => {
          tree.setState({focused: true});
          simulateWheel(2);
          assert(spy.calledWith(-0.5));
          assert(preventDefaultSpy.called);
        });

        it('unless input is not focused or readOnly or disabled', () => {
          tree.setProps({disabled: true});
          simulateWheel();
          assert(!spy.called);

          tree.setProps({disabled: false, readOnly: true});
          simulateWheel();
          assert(!spy.called);

          tree.setProps({disabled: false, readOnly: false});
          tree.setState({focused: false});
          simulateWheel();
          assert(!spy.called);
        });
      });

      it('when up or page up arrow keys are pressed', () => {
        const input = findInput(tree);
        input.simulate('keyDown', {keyCode: 38, preventDefault: preventDefaultSpy}); // up arrow
        assert(spy.calledWith(0.5));
        input.simulate('keyDown', {keyCode: 33, preventDefault: preventDefaultSpy}); // page up
        assert(spy.calledWith(1));
        assert.deepEqual(preventDefaultSpy.callCount, 2);
      });

      it('when down or page down arrow keys are pressed', () => {
        const input = findInput(tree);
        input.simulate('keyDown', {keyCode: 40, preventDefault: preventDefaultSpy}); // down arrow
        assert(spy.calledWith(-0.5));
        input.simulate('keyDown', {keyCode: 34, preventDefault: preventDefaultSpy}); // page down
        assert(spy.calledWith(-1));
        assert.deepEqual(preventDefaultSpy.callCount, 2);
      });
    });
  });

  it('sets focused class when focused', () => {
    const tree = shallow(<NumberInput />);
    findInput(tree).simulate('focus');
    assert.equal(tree.prop('focused'), true);
    findInput(tree).simulate('blur');
    assert.equal(tree.prop('focused'), false);
  });

  describe('support max', () => {
    describe('if value is greater than or equal', () => {
      let tree;
      let spy;
      let preventDefaultSpy;

      beforeEach(() => {
        spy = sinon.spy();
        preventDefaultSpy = sinon.spy();
        tree = shallow(<NumberInput max={10} value={10} onChange={spy} />);
      });

      it('disables increment button', () => {
        assert.equal(findIncrementButton(tree).prop('disabled'), true);
      });

      it('won\'t increment if up arrow pressed', () => {
        findInput(tree).simulate('keyDown', {keyCode: 38, preventDefault: preventDefaultSpy});
        assert(!spy.called);
      });

      describe('will jump value to max if home key is pressed', () => {
        const simulateKeyDown = () => {
          findInput(tree).simulate('keyDown', {keyCode: 36, preventDefault: preventDefaultSpy});
        };

        it('unless input is not focused or readOnly or disabled', () => {
          tree.setProps({disabled: true});
          simulateKeyDown();
          assert(!spy.called);

          tree.setProps({disabled: false, readOnly: true});
          simulateKeyDown();
          assert(!spy.called);

          tree.setProps({disabled: false, readOnly: false});
          tree.setState({focused: false});
          simulateKeyDown();
          assert(!spy.called);
        });

        it('and the input can accept input', () => {
          tree.setState({focused: true});
          tree.setProps({value: 1});
          simulateKeyDown();
          assert(spy.calledWith(10));
          assert(preventDefaultSpy.called);
        });
      });

      it('will allow changing value greater than max, but marks it invalid', () => {
        tree.setProps({value: 12});
        assert.equal(findIncrementButton(tree).prop('disabled'), true);
        assert.equal(findInput(tree).prop('invalid'), true);
      });
    });
  });

  describe('support min', () => {
    describe('if value is less than or equal', () => {
      let tree;
      let spy;
      let preventDefaultSpy;

      beforeEach(() => {
        spy = sinon.spy();
        preventDefaultSpy = sinon.spy();
        tree = shallow(<NumberInput min={-10} value={-10} onChange={spy} />);
      });

      it('disables decrement button', () => {
        assert.equal(findDecrementButton(tree).prop('disabled'), true);
      });

      it('won\'t decrement if down arrow pressed', () => {
        findInput(tree).simulate('keyDown', {keyCode: 40, preventDefault: preventDefaultSpy});
        assert(!spy.called);
      });

      describe('will jump value to max if end key is pressed', () => {
        const simulateKeyDown = () => {
          findInput(tree).simulate('keyDown', {keyCode: 35, preventDefault: preventDefaultSpy});
        };

        it('unless input is not focused or readOnly or disabled', () => {
          tree.setProps({disabled: true});
          simulateKeyDown();
          assert(!spy.called);

          tree.setProps({disabled: false, readOnly: true});
          simulateKeyDown();
          assert(!spy.called);

          tree.setProps({disabled: false, readOnly: false});
          tree.setState({focused: false});
          simulateKeyDown();
          assert(!spy.called);
        });

        it('and the input can accept input', () => {
          tree.setState({focused: true});
          tree.setProps({value: -1});
          simulateKeyDown();
          assert(spy.calledWith(-10));
          assert(preventDefaultSpy.called);
        });
      });

      it('will allow setting value to less than min, but marks it invalid', () => {
        tree.setProps({value: -12});
        assert.equal(findDecrementButton(tree).prop('disabled'), true);
        assert.equal(tree.state('valueInvalid'), true);
        assert.equal(findInput(tree).prop('invalid'), true);
      });

      it('will allow input change value to be less than min, but marks it invalid', () => {
        const spSpy = sinon.spy();
        findInput(tree).simulate('change', -12, {stopPropagation: spSpy});
        assert.equal(findDecrementButton(tree).prop('disabled'), true);
        assert.equal(tree.state('valueInvalid'), true);
        assert.equal(findInput(tree).prop('invalid'), true);
        assert(spSpy.called);
      });
    });
  });

  describe('input change', () => {
    let tree;
    let spy;
    let spSpy;

    beforeEach(() => {
      spSpy = sinon.spy();
      spy = sinon.spy();
      tree = shallow(<NumberInput defaultValue={1} onChange={spy} />);
    });

    it('will not allow non-numeric characters', () => {
      findInput(tree).simulate('change', 'foo', {stopPropagation: spSpy});
      assert(!spy.called);
      assert.equal(findInput(tree).prop('value'), 1);
      assert(spSpy.called);
    });

    it('will allow a single negative sign even though it is not a number', () => {
      findInput(tree).simulate('change', '-', {stopPropagation: spSpy});
      assert(!spy.called);
      assert.equal(findInput(tree).prop('value'), '-');
      assert(spSpy.called);
    });

    it('will allow numeric values', () => {
      findInput(tree).simulate('change', '-5', {stopPropagation: spSpy});
      assert(spy.calledWith(-5));
      assert.equal(tree.state('value'), '-5');
      assert.equal(findInput(tree).prop('value'), '-5');
      assert(spSpy.called);
    });
  });

  it('supports additional classNames', () => {
    const tree = shallow(<NumberInput className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<NumberInput foo />);
    assert.equal(findInput(tree).prop('foo'), true);
  });
});

const findInput = tree => tree.find(Textfield);
const findAllButtons = tree => tree.find(Button);
const findDecrementButton = tree => tree.find({icon: 'chevronDown'});
const findIncrementButton = tree => tree.find({icon: 'chevronUp'});