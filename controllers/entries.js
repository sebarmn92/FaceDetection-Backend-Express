const handleEntries = (req, res, db, logger) => {
    const { id } = req.body;
    db('users').where({ 'id':id})
    .increment('entries', 1)
    .returning('entries')
    .then((data) => {
        res.status(200).json(data[0].entries)
    }).catch((e) => {
        logger.log({
            level : 'error',
            message : e
        })
        res.status(500).json('Something went wrong. Contact System Administrator')
    })
}

module.exports = {
    'handleEntries' : handleEntries
}