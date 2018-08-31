const txtKeys = ['chapter_name', 'synopsis', 'detail', 'sel1_txt', 'sel2_txt', 'sel3_txt', 'sel4_txt']

const getNameTrans = (name, map, scenarioName) => {
  const item = map.get(name)
  if (item) {
    let existScenario = ''
    if (item.scenarios.length) {
      for (let sName of item.scenarios) {
        if (scenarioName.indexOf(sName) !== -1) {
          existScenario = sName
          break
        }
      }
    }
    const result = { trans: item.trans, noun: item.noun }
    if (existScenario) {
      result.trans = item[existScenario].trans
      result.noun = item[existScenario].noun
    }
    return result.trans
  }
  return null
}

const replaceChar = (key, item, map, scenarioName) => {
  const name = item[key] ? item[key].trim() : null
  if (name && name !== 'null' && name !== '???' && name !== '？？？') {
    let trans = getNameTrans(name, map, scenarioName)
    let _name = name

    if (/\s?[\?？0-9０－９]{1,2}$/.test(name)) {
      // name with number or symbol
      const nameRst = name.match(/(.+?)\s?([\?？0-9０－９]{1,2})$/)
      const _trans = getNameTrans(nameRst[1], map, scenarioName)
      _name = nameRst[1]
      if (_trans) trans = `${_trans}${nameRst[2]}`
    } else if (/'s\sVoice$/.test(name)) {
      let nmKey = name.slice(0, name.length - 8)
      const _trans = getNameTrans(nmKey, map, scenarioName)
      if (_trans) trans = `${_trans}的声音`
    } else if (/の声$/.test(name)) {
      let nmKey = name.slice(0, name.length - 2)
      const _trans = getNameTrans(nmKey, map, scenarioName)
      if (_trans) trans = `${_trans}的声音`
    }

    if (trans) {
      item[key] = trans
    } else if (trans !== '') {
      return _name
    }
  }
}

const transStart = async (data, pathname) => {
  const pathRst = pathname.match(/\/scenario.*?\/(scene[^\/]+)\/?/)
  if (!pathRst || !pathRst[1]) return data
  const scenarioName = pathRst[1]
  const userName = '123'
  const nameMap = Game.lang !== 'jp' ? nameData['enNameMap'] : nameData['jpNameMap']

  let transMap = new Map()

  data.forEach((item, index) => {
    let name1, name2, name3
    name1 = replaceChar('charcter1_name', item, nameMap, scenarioName)
    name2 = replaceChar('charcter2_name', item, nameMap, scenarioName)
    name3 = replaceChar('charcter3_name', item, nameMap, scenarioName)

    const obj =  transMap.get(item.id)
    if (!obj) return
    txtKeys.forEach(key => {
      if (obj[key]) {
        item[key] = obj[key]
      }
    })
  })

  return data
}

export default async function (data, pathname) {
  if (Array.isArray(data)) {
    return await transStart(data, pathname)
  } else if (Array.isArray(data.scene_list)) {
    return Object.assign(data, {
      scene_list: await transStart(data.scene_list, pathname)
    })
  } else {
    return data
  }
}
