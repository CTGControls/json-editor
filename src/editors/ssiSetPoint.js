import { AbstractEditor } from '../editor.js'
import { isInteger, isNumber } from '../utilities.js'

/// <summary>
/// Used for SuperSystems.Com (SSi) 9xxx controllers.
/// The set point in the SSi in in a short so if you would
/// like a decimal number you need to off set the number.
/// This editor displays the set point as a decimal
/// but reads and saves the set point as a short.
/// All parameters names are case sensitive
/// </summary>
/// <example>
///   <code>
///   "loop2": {
///     "type": 'integer',
///     "format": 'ssiSetPoint',
///     "title": "carbon",
///     "minimum": -2,
///     "maximum": 10019,
///     "ShowDisableCheckBox" : false,
///     "disabledValue" : -1,
///     "step" : 0.01,
///     "impliedDecimalPoints" : 2
///   }
///   </code>
/// </example>
/// <param name="type">Must be a type of integer (Case </param>
/// <param name="format">Must be a type of SSI_HourMinuteToInt</param>
/// <param name="title">Title of the control.</param>
/// <param name="minimum">Minimum time setting. Not currently implemented.</param>
/// <param name="minimum">Maximum time setting. Used for hours only.</param>
/// <param name="ShowDisableCheckBox">
///   Boolean value : ,
///   true or undefined = show check box ,
///   false = hides the check box
/// </param>
/// <param name="disabledValue">
///   Integer value : ,
///   integer = sets the disable value ,
///   undefined = -1
/// </param>
/// <param name="step">
///   Integer value : ,
///   number the up button adds to the value
///   number the down button subtracts from the value
/// </param>
/// <param name="impliedDecimalPoints">
///   Integer value : ,
///   number of implied decimal points
/// </param>
/// <returns>integer</returns>
export class ssiSetPointEditor extends AbstractEditor {
  preBuild () {
    super.preBuild()

    // Build input box
    this.input = this.buildInputBox(null, null)

    // Add a lable for the input
    this.lable = this.header = this.theme.getFormInputLabel(this.getTitle(), this.isRequired())

    // create a table for the for the controls
    this.table = this.theme.getTable()

    // Add the lable to the tables top row
    if (this.lable.innerText !== '') {
      const tableCellTitle = this.theme.getTableCell()
      tableCellTitle.appendChild(this.lable)
      const tableRowTitle = this.theme.getTableRow()
      tableRowTitle.appendChild(tableCellTitle)
      this.table.appendChild(tableRowTitle)
    }

    // Build a disable ckeck box
    this.disableCheckBox = this.theme.getCheckbox()
  }

  // used to build a input box with all Attribute needed
  buildInputBox (min, max) {
    const input = this.theme.getFormInputField('input')

    // Set the input type to a number.
    input.setAttribute('type', 'number')

    // Set up the input box as a step type
    if (!input.getAttribute('step')) {
      input.setAttribute('step', '1')
    }

    // Set the minimum value for the input box from the schema
    if (min === 'undefined' || min === null) {
      if (typeof this.schema.minimum !== 'undefined') {
        let { minimum } = this.schema

        if (typeof this.schema.exclusiveMinimum !== 'undefined') {
          minimum += 1
        }

        if (minimum >= -32767) {
          input.setAttribute('min', minimum)
        } else {
          input.setAttribute('min', -32767)
        }
      }
    } else {
      // if the minimum value is overridden set from the caller
      input.setAttribute('min', min)
    }

    // Set the maximum value for the input box from the schema
    if (max === 'undefined' || max === null) {
      if (typeof this.schema.maximum !== 'undefined') {
        let { maximum } = this.schema

        if (typeof this.schema.exclusiveMaximum !== 'undefined') {
          maximum -= 1
        }

        if (maximum <= 32768) {
          input.setAttribute('max', maximum)
        } else {
          input.setAttribute('max', 32768)
        }
      }
    } else {
      // if the maximum value is overridden set from the caller
      input.setAttribute('max', max)
    }

    return input
  }

  build () {
    super.build()

    // Build the input table Cell
    const tableCellInput = this.theme.getTableCell()

    // Add the input box to table Cell
    tableCellInput.appendChild(this.input)

    // create a table row for the control
    const tableRow = this.theme.getTableRow()

    // Add the cells to the row
    tableRow.appendChild(tableCellInput)

    // Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler = (e) => {
      if (typeof this.schema.ShowDisableCheckBox !== 'undefined' || this.schema.ShowDisableCheckBox === true) {
        if (this.disableCheckBox.checked) {
          this.input.setAttribute('hidden', true)
        } else {
          this.input.removeAttribute('hidden')
        }
      }
      this.setValue(this.input.value)
      this.onChange(true)
    }

    // add a change event handler to the table
    this.table.addEventListener('change', this.SomeThingChangedHandler, false)

    // add the row to the table
    this.table.appendChild(tableRow)

    // check to see if the disable box is undefined in the schema
    // or requested to be shown
    // if it is build the check box and add it to the table
    if (typeof this.schema.ShowDisableCheckBox === 'undefined' || this.schema.ShowDisableCheckBox === true) {
      const disableCheckBoxLable = this.theme.getCheckboxLabel('Disable')

      const disableCheckBoxControl = this.theme.getFormControl(disableCheckBoxLable, this.disableCheckBox)

      const tableCellDisableCheckBox = this.theme.getTableCell()
      tableCellDisableCheckBox.appendChild(disableCheckBoxControl)

      const tableRowDisableCheckBox = this.theme.getTableRow()
      tableRowDisableCheckBox.appendChild(tableCellDisableCheckBox)

      this.table.appendChild(tableRowDisableCheckBox)
    }

    // Add the table to the AbstractEditor base container
    this.container.appendChild(this.table)
  }

  // called by the SomeThingChangedHandler
  // every time the control is changed
  setValue (value, initial) {
    // Check to see if the value is a number
    value = isNumber(value.toString()) ? value : 0

    if (typeof this.schema.impliedDecimalPoints !== 'undefined' && isNumber(this.schema.impliedDecimalPoints.toString()) && this.schema.impliedDecimalPoints > 0) {
      const impliedDecimalPoints = this.schema.impliedDecimalPoints
      value *= Math.pow(10, impliedDecimalPoints)
      this.input.value = value / Math.pow(10, impliedDecimalPoints)
    }

    value = Math.floor(value)

    // Check to see if the value is a int
    value = isInteger(value.toString()) ? parseInt(value) : 0

    // Check to see if the number is less then -32767
    if (value < -32767) {
      value = -32767
      this.value = -32767
    }

    if (value > 32768) {
      value = 32768
      this.value = -32768
    }

    if (typeof this.schema.ShowDisableCheckBox === 'undefined' || this.schema.ShowDisableCheckBox === true) {
      if (this.disableCheckBox.checked) {
        if (typeof this.schema.disabledValue === 'undefined') {
          value = -1
        } else {
          value = isInteger(this.schema.disabledValue.toString()) ? parseInt(this.schema.disabledValue) : -301
        }
      }
    }

    // update the global storge value
    this.value = value
    this.onChange(true)
  }
}
