import { AbstractEditor } from '../editor.js'
import { isInteger, isNumber } from '../utilities.js'

/// <summary>
/// Used for SuperSystems.Com (SSi) 9xxx controllers.
/// The time in the SSi in in a short of total min
/// but users like to see the time in hours and minutes.
/// This editor displays the time in hours and minutes
/// but reads and saves the time in minutes.
/// All parameters names are case sensitive
/// </summary>
/// <example>
///   <code>
///   "option": {
///     "type": 'integer',
///     "format": 'SSI_HourMinuteToInt',
///     "title": "soak time",
///     "minimum": -2,
///     "maximum": 10019,
///     "ShowDisableCheckBox" : false,
///     "disabledValue" : -1
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
/// <returns>integer</returns>
export class ffmHourMinuteEditor extends AbstractEditor {
  preBuild () {
    super.preBuild()

    // Build Hours input box
    this.inputHours = this.buildInputBox(0, null)

    // Build Minutes input box
    this.inputMinutes = this.buildInputBox(0, 59)

    // Add a lable for the inputHours
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

        if (minimum > 0) {
          input.setAttribute('min', minimum)
        } else {
          input.setAttribute('min', 0)
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

        if (maximum > 0) {
          input.setAttribute('max', Math.floor((maximum - 59) / 60))
        } else {
          input.setAttribute('max', 59)
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

    // Build the Hours table Cell
    const tableCellHours = this.theme.getTableCell()

    // Add the Hours input box to Hours table Cell
    tableCellHours.appendChild(this.inputHours)

    // Build the minutes table Cell
    const tableCellMinutes = this.theme.getTableCell()

    // Add the minutes input box to minutes table Cell
    tableCellMinutes.appendChild(this.inputMinutes)

    // create a table row for the control
    const tableRow = this.theme.getTableRow()
    // Add the cells to the row
    tableRow.appendChild(tableCellHours)
    tableRow.appendChild(tableCellMinutes)

    // Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler = (e) => {
      if (typeof this.schema.ShowDisableCheckBox !== 'undefined' || this.schema.ShowDisableCheckBox === true) {
        if (this.disableCheckBox.checked) {
          this.inputHours.setAttribute('hidden', true)
          this.inputMinutes.setAttribute('hidden', true)
        } else {
          this.inputHours.removeAttribute('hidden')
          this.inputMinutes.removeAttribute('hidden')
        }
      }

      const totalhours = isInteger(this.inputHours.value) ? parseInt(this.inputHours.value) : 0
      const totalMinutes = isInteger(this.inputMinutes.value) ? parseInt(this.inputMinutes.value) : 0
      const totalTime = (parseInt(totalhours) * 60) + parseInt(totalMinutes)
      this.setValue(totalTime)
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

    // Check to see if the value is a int
    value = isInteger(value.toString()) ? parseInt(value) : 0

    // Check to see if the number is less then zero
    if (value < 0) {
      value = 0
      this.value = 0
    }

    // if the number is one hour or more do the math to separate the hours and minutes
    // else just move the value to the minutes
    if (value >= 60) {
      this.inputHours.value = parseInt(Math.floor(value / 60))
      this.inputMinutes.value = parseInt(Math.floor(value % 60))
    } else {
      this.inputHours.value = 0
      this.inputMinutes.value = value
    }

    if (typeof this.schema.ShowDisableCheckBox === 'undefined' || this.schema.ShowDisableCheckBox === true) {
      if (this.disableCheckBox.checked) {
        if (typeof this.schema.disabledValue === 'undefined') {
          value = -1
        } else {
          value = isInteger(this.schema.disabledValue.toString()) ? parseInt(this.schema.disabledValue) : -1
        }
      }
    }

    // update the global storge value
    this.value = value
    this.onChange(true)
  }
}
