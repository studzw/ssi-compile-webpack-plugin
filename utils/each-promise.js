function isOver(arr){
    return arr.every((i, j, a) => {
        return i.statue && (i.statue === 'resolve' || i.statue === 'reject' || i.statue === 'error')
    })
}

function isError(arr){
    return arr.every((i, j, a) => {
        return i.statue && (i.statue === 'reject' || i.statue === 'error')
    })
}

/**
 * 遍历promise数组
 * 在所有promise都完成后返回一个promise
 * 只有数组内的promise都返回reject/error，整个promise才会reject其他均为resolve
 * resolve同样是一个数组，与入参一一对应
 * 
 * @param {Array<promise>} promiseList 
 * @returns {Array<promise>} promiseList结果集合
 */
function eachPromise(promiseList){
    let result = new Array(promiseList.length).fill(Object.create(null))
    return new Promise((resolve, reject) => {
        promiseList.forEach((item, index, array) => {
            item
            .then((res) => {
                result[index] = {
                    statue: 'resolve',
                    data: res
                }

                if(isOver(result)){
                    if(!isError(result)){
                        resolve(result)
                    }else{
                        reject(result)
                    }
                }

            }, (err) => {

                result[index] = {
                    statue: 'reject',
                    data: err
                }

                if(isOver(result)){
                    if(!isError(result)){
                        resolve(result)
                    }else{
                        reject(result)
                    }
                }
            })
            .catch((err) => {
                result[index] = {
                    statue: 'error',
                    data: err
                }
                if(isOver(result)){
                    if(!isError(result)){
                        resolve(result)
                    }else{
                        reject(result)
                    }
                }
            })
        })

    })
}

module.exports = eachPromise