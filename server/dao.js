"use strict";
// import modules
const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database("CSM_Small.db", (err) => {
    if (err) throw err;
});

db.run("PRAGMA foreign_keys = ON");

// get all the public pages
exports.getPubPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.author_id = Users.id AND Pages.publication_date <= date('now', 'localtime') ORDER BY Pages.publication_date DESC";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map(
                (row) => ({
                    id: row.page_id,
                    title: row.title,
                    author_id: row.author_id,
                    author: row.name,
                    publication_date: row.publication_date,
                    creation_date: row.creation_date,
                })
            );
            resolve(pages);
        });
    });
}

// get all the pages
exports.getPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.author_id = Users.id ORDER BY Pages.publication_date DESC";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);

                return;
            }
            const pages = rows.map(
                (row) => {
                    return {
                        id: row.page_id,
                        title: row.title,
                        author_id: row.author_id,
                        author: row.name,
                        publication_date: row.publication_date,
                        creation_date: row.creation_date,
                    }
                }
            );
            resolve(pages);
        });
    });
};

// get the page by id
exports.getPageByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.page_id = ? AND Pages.author_id = Users.id";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            const page = {
                id: row.page_id,
                title: row.title,
                author_id: row.author_id,
                author: row.name,
                publication_date: row.publication_date,
                creation_date: row.creation_date,
            }
            resolve(page);
        });
    });
};

// get the content of the page by id
exports.getPageContent = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT ContentBlocks.*, Pages.title FROM ContentBlocks, Pages WHERE ContentBlocks.page_id = ? AND Pages.page_id = ContentBlocks.page_id ORDER BY ContentBlocks.order_index ASC";
        db.all(sql, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const content = rows.map(
                (row) => {
                    return {
                        block_id: row.block_id,
                        block_type: row.block_type,
                        content: row.content,
                        order_index: row.order_index,
                        page_id: row.page_id,
                    }
                }
            );
            resolve(content);
        });
    });
};

// insert a new page
exports.insertPage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO Pages(title, author_id, creation_date, publication_date) VALUES(?, ?, ?, ?)";
        db.run(sql, [page.title, page.author_id, page.creation_date, page.publication_date], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// insert a new content block
exports.insertContentBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO ContentBlocks (page_id, block_type, content, order_index) VALUES (?, ?, ?, ?)";
        db.run(sql, [block.page_id, block.block_type, block.content, block.order_index], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// scale up the order index of the content blocks
exports.scaleUpContentBlock = (page_id, order_index, block_id) => {
    return new Promise ((resolve, reject) => {
        const sql = "UPDATE ContentBlocks SET order_index = order_index + 1 WHERE page_id = ? AND order_index >= ? AND block_id != ?";
        db.run(sql, [page_id ,order_index, block_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    })
};

// update the page
exports.updatePage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE Pages SET title = ?, author_id = ?, publication_date = ? WHERE page_id = ?";
        db.run(sql, [page.title, page.author_id, page.publication_date, page.page_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// update the content block
exports.updateContentBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE ContentBlocks SET block_type = ?, content = ?, order_index = ? WHERE block_id = ?";
        db.run(sql, [block.block_type, block.content, block.order_index, block.block_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// get the content block by id
exports.getContentBlock = (blockId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM ContentBlocks WHERE block_id = ?";
        db.get(sql, [blockId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
};

// insert a new content block
exports.insertContentBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO ContentBlocks (page_id, block_type, content, order_index) VALUES (?, ?, ?, ?)";
        db.run(sql, [block.page_id, block.block_type, block.content, block.order_index], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// rescale the order index of the content blocks
exports.rescaleOrderIndex = (page_id, order_index) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE ContentBlocks SET order_index = order_index - 1 WHERE page_id = ? AND order_index >= ?";
        db.run(sql, [page_id, order_index], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// change the order index of the content blocks
exports.changeIndexOrder = (block_id, order_index) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE ContentBlocks SET order_index = ? WHERE block_id = ?";
        db.run(sql, [order_index, block_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// delete the content block
exports.deleteContentBlock = (block_id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM ContentBlocks WHERE block_id = ?";
        db.run(sql, [block_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// delete the page
exports.deletePage = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM Pages WHERE page_id = ?";
        db.run(sql, [pageId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// get all the images
exports.getAllImages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Images";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const images = rows.map(
                (row) => {
                    return {
                        image_id: row.image_id,
                        image_path: row.path,
                    }
                }
            );
            resolve(images);
        });
    });
};

// get the image by id
exports.updateBlockImage = (block_id, image_path) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE ContentBlocks SET content = ? WHERE block_id = ?";
        db.run(sql, [image_path, block_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// delete empty block on save
exports.cleanPage = (page_id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM ContentBlocks WHERE content = '' AND page_id = ?";
        db.run(sql, [page_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// update the publication date
exports.updatePubDate = (page_id, pub_date) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE Pages SET publication_date = ? WHERE page_id = ?";
        db.run(sql, [pub_date, page_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// update the title of the page
exports.updatePageTitle = (page_id, title) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE Pages SET title = ? WHERE page_id = ?";
        db.run(sql, [title, page_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};
