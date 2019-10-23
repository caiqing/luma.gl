import {log} from '../../utils';
import ScenegraphNode from './scenegraph-node';
import {mat4_create, mat4_multiply} from './math-utils';

export default class GroupNode extends ScenegraphNode {
  constructor(props = {}) {
    props = Array.isArray(props) ? {children: props} : props;
    const {children = []} = props;
    log.assert(
      children.every(child => child instanceof ScenegraphNode),
      'every child must an instance of ScenegraphNode'
    );
    super(props);
    this.children = children;
  }

  // Unpacks arrays and nested arrays of children
  add(...children) {
    for (const child of children) {
      if (Array.isArray(child)) {
        this.add(...child);
      } else {
        this.children.push(child);
      }
    }
    return this;
  }

  remove(child) {
    const children = this.children;
    const indexOf = children.indexOf(child);
    if (indexOf > -1) {
      children.splice(indexOf, 1);
    }
    return this;
  }

  removeAll() {
    this.children = [];
    return this;
  }

  delete() {
    this.children.forEach(child => child.delete());
    this.removeAll();
    super.delete();
  }

  traverse(visitor, {worldMatrix = mat4_create()} = {}) {
    const modelMatrix = mat4_create();
    mat4_multiply(modelMatrix, worldMatrix, this.matrix);

    for (const child of this.children) {
      if (child instanceof GroupNode) {
        child.traverse(visitor, {worldMatrix: modelMatrix});
      } else {
        visitor(child, {worldMatrix: modelMatrix});
      }
    }
  }
}
