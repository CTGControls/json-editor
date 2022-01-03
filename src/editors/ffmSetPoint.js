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
export class ffmSetPointEditor extends AbstractEditor {
  preBuild () {
    super.preBuild()

    this.disabledValueDefault = -1

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

    // Set up the input box as a step type ,
    // and set number the up button adds to the value
    // and set number the down button subtracts from the value
    if (!input.getAttribute('step')) {
      if (typeof this.schema.step !== 'undefined' && !(isNumber(this.schema.step.toString()))) {
        input.setAttribute('step', '1')
      } else {
        input.setAttribute('step', this.schema.step)
      }
    }

    // Set the minimum value for the input box from the schema
    let minimum = 0
    if (min === 'undefined' || min === null) {
      if (typeof this.schema.minimum !== 'undefined') {
        minimum = this.schema.minimum

        if (typeof this.schema.exclusiveMinimum !== 'undefined') {
          minimum += 1
        }
      }
    } else {
      // if the minimum value is overridden set from the caller
      minimum = min
    }
    if (minimum >= -32768) {
      input.setAttribute('min', minimum)
    } else {
      input.setAttribute('min', -32768)
    }

    // Set the maximum value for the input box from the schema
    let maximum = 0
    if (max === 'undefined' || max === null) {
      if (typeof this.schema.maximum !== 'undefined') {
        maximum = this.schema.maximum

        if (typeof this.schema.exclusiveMaximum !== 'undefined') {
          maximum -= 1
        }
      }
    } else {
      // if the maximum value is overridden set from the caller
      maximum = max
    }

    if (maximum <= 32768) {
      input.setAttribute('max', maximum)
    } else {
      input.setAttribute('max', 32768)
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
      console.log('find it')
      var valueLocal = isNumber(this.input.value.toString()) ? this.input.value : 0

      if (typeof this.schema.impliedDecimalPoints !== 'undefined' && isNumber(this.schema.impliedDecimalPoints.toString()) && this.schema.impliedDecimalPoints > 0) {
        const impliedDecimalPoints = this.schema.impliedDecimalPoints
        const mathPowerOf10 = Math.pow(10, impliedDecimalPoints)
        valueLocal = valueLocal * mathPowerOf10
      }

      this.setValue(valueLocal)
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
    // Check to see if the value is a int
    var valueLocal = isNumber(value.toString()) ? value : 0

    if (typeof this.schema.impliedDecimalPoints !== 'undefined' && isNumber(this.schema.impliedDecimalPoints.toString()) && this.schema.impliedDecimalPoints > 0) {
      const impliedDecimalPoints = this.schema.impliedDecimalPoints
      const mathPowerOf10 = Math.pow(10, impliedDecimalPoints)
      this.input.value = (valueLocal / mathPowerOf10).toFixed(impliedDecimalPoints)
    } else {
      this.input.value = valueLocal
    }

    if (typeof this.schema.ShowDisableCheckBox !== 'undefined' || this.schema.ShowDisableCheckBox === true) {
      if (
        (typeof this.schema.disabledValue === 'undefined' && this.disabledValueDefault === this.input.value) ||
        (typeof this.schema.disabledValue !== 'undefined' && this.schema.disabledValue === value)
      ) {
        this.disableCheckBox.checked = true
        this.input.setAttribute('hidden', true)
      } else {
        this.disableCheckBox.checked = false
        this.input.removeAttribute('hidden')
      }
    }

    valueLocal = Math.floor(valueLocal)

    // Check to see if the number is less then -32767
    if (valueLocal < -32767) {
      valueLocal = -32767
      this.valueLocal = -32767
    }

    if (valueLocal > 32768) {
      valueLocal = 32768
      this.valueLocal = -32768
    }

    if (typeof this.schema.ShowDisableCheckBox === 'undefined' || this.schema.ShowDisableCheckBox === true) {
      if (this.disableCheckBox.checked) {
        if (typeof this.schema.disabledValue === 'undefined') {
          valueLocal = this.disabledValueDefault
        } else {
          valueLocal = isInteger(this.schema.disabledValue.toString()) ? parseInt(this.schema.disabledValue) : this.disabledValueDefault
        }
      }
    }

    // update the global storge value
    this.value = valueLocal
    this.onChange(true)
  }
}
