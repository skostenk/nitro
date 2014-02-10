escape = require '../utils/escape'

module.exports = (list) ->
  """
    <li data-item="#{ list.id }" class="list">
      <span class="name">#{ escape list.name }</span>
      <div class="count">#{ list.tasks.length }</div>
    </li>
  """
