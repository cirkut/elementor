export default class Helpers {
	static findViewRecursive( parent, key, value, multiple = true ) {
		let found = [];
		for ( const x in parent._views ) {
			const view = parent._views[ x ];

			if ( value === view.model.get( key ) ) {
				found.push( view );
				if ( ! multiple ) {
					return found;
				}
			}

			if ( view.children ) {
				const views = Helpers.findViewRecursive( view.children, key, value, multiple );
				if ( views.length ) {
					found = found.concat( views );
					if ( ! multiple ) {
						return found;
					}
				}
			}
		}

		return found;
	}

	static findViewById( id ) {
		const elements = Helpers.findViewRecursive(
			elementor.getPreviewView().children,
			'id',
			id,
			false
		);

		return elements ? elements[ 0 ] : false;
	}

	static isValidChild( childModel, parentModel ) {
		const parentElType = parentModel.get( 'elType' ),
			draggedElType = childModel.get( 'elType' );

		if ( childModel.get( 'isInner' ) && parentModel.get( 'isInner' ) ) {
			return false;
		}

		if ( draggedElType === parentElType ) {
			return false;
		}

		if ( 'section' === draggedElType && ! childModel.get( 'isInner' ) && 'column' === parentElType ) {
			return false;
		}

		const childTypes = elementor.helpers.getElementChildType( parentElType );

		return childTypes && -1 !== childTypes.indexOf( childModel.get( 'elType' ) );
	}

	static isValidGrandChild( childModel, targetContainer ) {
		let result;

		const childElType = childModel.get( 'elType' );

		switch ( targetContainer.model.get( 'elType' ) ) {
			case 'document':
				result = true;
				break;

			case 'section':
				result = 'widget' === childElType;
				break;

			default:
				result = false;
		}

		return result;
	}

	static isSameElement( sourceModel, targetContainer ) {
		const targetElType = targetContainer.model.get( 'elType' ),
			sourceElType = sourceModel.get( 'elType' );

		if ( targetElType !== sourceElType ) {
			return false;
		}

		if ( 'column' === targetElType && 'column' === sourceElType ) {
			return true;
		}

		return targetContainer.model.get( 'isInner' ) === sourceModel.get( 'isInner' );
	}

	static getPasteOptions( sourceModel, targetContainer ) {
		const result = {};

		result.isValidChild = Helpers.isValidChild( sourceModel, targetContainer.model );
		result.isSameElement = Helpers.isSameElement( sourceModel, targetContainer );
		result.isValidGrandChild = Helpers.isValidGrandChild( sourceModel, targetContainer );

		return result;
	}

	static isPasteEnabled( targetContainer ) {
		const storage = elementorCommon.storage.get( 'clipboard' );

		// No storage? no paste.
		if ( ! storage || ! storage[ 0 ] ) {
			return false;
		}

		if ( ! ( storage[ 0 ] instanceof Backbone.Model ) ) {
			storage[ 0 ] = new Backbone.Model( storage[ 0 ] );
		}

		const pasteOptions = Helpers.getPasteOptions( storage[ 0 ], targetContainer );

		return Object.values( pasteOptions ).some(
			( opt ) => !! opt
		);
	}
}
