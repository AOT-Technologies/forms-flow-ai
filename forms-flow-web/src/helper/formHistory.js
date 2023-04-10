/**
 *
 * @param {Array} formHistory
 */
export const setVersionNumberIfNotExist = (formHistory)=>{
    let versionNumber = 0;
    if(formHistory[0]?.chageLog?.version){
        versionNumber = +formHistory[0]?.chageLog?.version.replace("v","");
    }else{
        versionNumber = formHistory.reduce((count,item)=>{
            if(item.changeLog.new_version){
              count++;
            }
            return count;
          },0);
    }
    return formHistory.map((history)=>{
        const {changeLog} = history;
        changeLog.version = (
            changeLog.version ? changeLog.version : (
                changeLog.new_version ? `v${versionNumber}` : `v${versionNumber}`
            )
        );
        if(changeLog.new_version){
            versionNumber--;
        }
        return history;
    });
};
